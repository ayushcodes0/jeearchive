const User = require('../models/User');
const Result = require('../models/Result');
const Test = require('../models/Test');

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
