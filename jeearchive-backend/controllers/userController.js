const User = require('../models/User');
const Result = require('../models/Result');
const Test = require('../models/Test');
const bcrypt = require('bcryptjs');
const cloudinary = require('../utils/cloudinary');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    const results = await Result.find({ user: userId })
      .populate('test', 'title date')
      .sort({ createdAt: -1 });

    let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0, totalScore = 0;

    const recentResults = results
  .filter(result => result.test)  // ensure test is populated
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

    res.status(200).json({
        message: "User profile data fetched successfully",
        user,
        lifetimeStats,
        recentResults
    });

  } catch (err) {
    console.error('User profile error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { firstName, lastName, gender, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;

    // Password update logic
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Profile image upload (if any)
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
      user.profileImage = uploadResult.secure_url;
    }

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully' });

  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

