/* 

  This is my user controller.
  This page contains the controller for user.
  Such as : getUserProfile, updateUserProfile, 

*/

// importing User model, Result model, Test model, bcrypt, cloudinary, redisClient
const User = require('../models/User');
const Result = require('../models/Result');
const Test = require('../models/Test');
const bcrypt = require('bcryptjs');
const cloudinary = require('../utils/cloudinary');
const redisClient = require('../utils/redisClient');


// this is getUserProfile function used to get the user profile 
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:profile`;

    // Try cache first
    const cachedProfile = await redisClient.get(cacheKey);
    if (cachedProfile) {
      return res.status(200).json({
        message: "User profile data fetched successfully (cached)",
        ...JSON.parse(cachedProfile)
      });
    }

    const user = await User.findById(userId).select('-password');
    const results = await Result.find({ user: userId })
      .populate('test', 'title date')
      .sort({ createdAt: -1 });

    let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0, totalScore = 0;

    const recentResults = results
      .filter(result => result.test)
      .map(result => {
        totalCorrect += result.correctCount;
        totalWrong += result.wrongCount;
        totalUnattempted += result.unattemptedCount;
        totalScore += result.score;

        return {
          testTitle: result.test.title,
          date: result.test.date,
          score: result.score,
          totalMarks: result.totalMarks,
          correct: result.correctCount,
          wrong: result.wrongCount,
          unattempted: result.unattemptedCount
        };
      });

    const lifetimeStats = {
      testsGiven: results.length,
      totalCorrect,
      totalWrong,
      totalUnattempted,
      averageScore: results.length > 0 ? (totalScore / results.length).toFixed(2) : 0
    };

    const profileData = {
      user,
      lifetimeStats,
      recentResults
    };

    // Cache for 30 minutes (shorter TTL than test data since profile changes more frequently)
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(profileData));

    res.status(200).json({
      message: "User profile data fetched successfully",
      ...profileData
    });

  } catch (err) {
    console.error('User profile error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// this is updateUserProfile function used to update the user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, gender, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Track changes for cache invalidation
    let profileChanged = false;
    let passwordChanged = false;

    if (firstName && user.firstName !== firstName) {
      user.firstName = firstName;
      profileChanged = true;
    }
    if (lastName && user.lastName !== lastName) {
      user.lastName = lastName;
      profileChanged = true;
    }
    if (gender && user.gender !== gender) {
      user.gender = gender;
      profileChanged = true;
    }

    // Password update
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
      passwordChanged = true;
    }

    // Profile image upload
    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'user-profiles' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(buffer);
        });
      };

      const uploadResult = await streamUpload(req.file.buffer);
      if (user.profileImage !== uploadResult.secure_url) {
        user.profileImage = uploadResult.secure_url;
        profileChanged = true;
      }
    }

    // Only save and invalidate cache if changes were made
    if (profileChanged || passwordChanged) {
      await user.save();

      // Invalidate all relevant caches
      const cacheKeysToDelete = [
        `user:${userId}:profile`,           // Main profile cache
        `user:${userId}:stats`,            // Stats cache
        `user:${userId}:activity`,         // Activity feed
        `user:${userId}:results`           // Results cache
      ];

      await Promise.all(
        cacheKeysToDelete.map(key => 
          redisClient.del(key).catch(err => 
            console.error(`Cache deletion failed for ${key}:`, err)
          )
        )
      );
    }

    res.status(200).json({ 
      message: 'Profile updated successfully',
      updated: profileChanged || passwordChanged
    });

  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async(req, res) =>{
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};