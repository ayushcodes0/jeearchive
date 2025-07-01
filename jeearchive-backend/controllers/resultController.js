const Question = require('../models/Questions');
const Result = require('../models/Result');
const redisClient = require('../utils/redisClient');

exports.submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const userId = req.user.id;

    const questions = await Question.find({ test: testId });

    let score = 0, correct = 0, wrong = 0, unattempted = 0;

    const detailedAnswers = [];
    const subjectStats = {}; // For attemptSummary

    for (const question of questions) {
      const userAnswer = answers.find(ans => ans.questionId === question._id.toString());

      const ansObj = {
        question: question._id,
        selectedOption: userAnswer?.selectedOption || null,
        numericalAnswer: userAnswer?.numericalAnswer || null,
        correctOption: null,
        correctNumericalAnswer: null,
        isCorrect: false,
        markedForReview: userAnswer?.markedForReview || false,
        answeredAndMarkedForReview: userAnswer?.answeredAndMarkedForReview || false,
        visited: userAnswer?.visited || false
      };

      const subject = question.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = { correct: 0, wrong: 0, unattempted: 0 };
      }

      let isCorrect = false;

      if (question.type === 'mcq') {
        const correctOpt = question.options.find(opt => opt.isCorrect);
        ansObj.correctOption = correctOpt?.label;

        if (userAnswer?.selectedOption === correctOpt?.label) {
          isCorrect = true;
        }
      } else if (question.type === 'numerical') {
        ansObj.correctNumericalAnswer = question.correctAnswer;

        if (
          userAnswer?.numericalAnswer &&
          userAnswer.numericalAnswer.toString().trim() === question.correctAnswer
        ) {
          isCorrect = true;
        }
      }

      ansObj.isCorrect = isCorrect;

      if (!userAnswer || (!userAnswer.selectedOption && !userAnswer.numericalAnswer)) {
        unattempted++;
        subjectStats[subject].unattempted++;
      } else if (isCorrect) {
        score += question.marks;
        correct++;
        subjectStats[subject].correct++;
      } else {
        score -= question.negativeMarks || 0;
        wrong++;
        subjectStats[subject].wrong++;
      }

      detailedAnswers.push(ansObj);
    }

    const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);

    const result = await Result.create({
      user: userId,
      test: testId,
      answers: detailedAnswers,
      score,
      totalMarks,
      correctCount: correct,
      wrongCount: wrong,
      unattemptedCount: unattempted,
      attemptSummary: subjectStats
    });

    // Comprehensive Cache Invalidation
    const cacheKeysToDelete = [
      // User-specific caches
      `user:${userId}:availableTests`,
      `user:${userId}:attemptedTests`,
      `user:${userId}:results`,
      
      // Result-specific caches
      `result:${testId}:${userId}`,
      `result:${testId}:${userId}:detailed`,
    ];

    // Execute all cache deletions in parallel
    await Promise.all(
      cacheKeysToDelete.map(key => redisClient.del(key).catch(err => console.error(`Cache delete failed for ${key}:`, err))
    ));

    res.status(201).json({
      message: 'Test submitted and evaluated',
      result
    });

  } catch (err) {
    console.error('Test submission error:', err.message);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};


exports.getResultByTestId = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;
    const cacheKey = `result:${testId}:${userId}`;

    // Try cache first
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json({
        message: 'Result fetched successfully (cached)',
        result: JSON.parse(cachedResult)
      });
    }

    const result = await Result.findOne({ user: userId, test: testId })
      .populate('test', 'title description')
      .populate({
        path: 'answers.question',
        select: 'questionText questionImage options correctAnswer subject type'
      });

    if (!result) {
      return res.status(404).json({ message: 'Result not found for this test' });
    }

    // Cache for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    res.status(200).json({
      message: 'Result fetched successfully',
      result
    });
    
  } catch (err) {
    console.error('Error fetching result by testId:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllResultsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:results`;

    // Try cache first
    const cachedResults = await redisClient.get(cacheKey);
    if (cachedResults) {
      const parsed = JSON.parse(cachedResults);
      return res.status(200).json({ 
        message: 'Results fetched (cached)',
        results: parsed.results,
        lifetimeStats: parsed.lifetimeStats
      });
    }

    const results = await Result.find({ user: userId })
      .populate('test', 'title date shift')
      .sort({ createdAt: -1 });

    // Calculate lifetime stats
    let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0, totalScore = 0;

    results.forEach(result => {
      totalCorrect += result.correctCount;
      totalWrong += result.wrongCount;
      totalUnattempted += result.unattemptedCount;
      totalScore += result.score;
    });

    const lifetimeStats = {
      testsGiven: results.length,
      totalCorrect,
      totalWrong,
      totalUnattempted,
      averageScore: results.length > 0 ? (totalScore / results.length).toFixed(2) : 0
    };

    // Cache combined data for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify({
      results,
      lifetimeStats
    }));

    res.status(200).json({ 
      message: 'Results fetched successfully',
      results,
      lifetimeStats 
    });
  } catch (err) {
    console.error('Error fetching user results:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getResultsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `user:${userId}:results`;

    // Try cache first
    const cachedResults = await redisClient.get(cacheKey);
    if (cachedResults) {
      const parsed = JSON.parse(cachedResults);
      return res.status(200).json({
        message: "Results fetched successfully (cached)",
        results: parsed.results,
        lifetimeStats: parsed.lifetimeStats
      });
    }

    const results = await Result.find({ user: userId })
      .populate('test', 'title date shift')
      .sort({ createdAt: -1 });

    // Calculate lifetime stats
    let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0, totalScore = 0;

    results.forEach(result => {
      totalCorrect += result.correctCount;
      totalWrong += result.wrongCount;
      totalUnattempted += result.unattemptedCount;
      totalScore += result.score;
    });

    const lifetimeStats = {
      testsGiven: results.length,
      totalCorrect,
      totalWrong,
      totalUnattempted,
      averageScore: results.length > 0 ? (totalScore / results.length).toFixed(2) : 0
    };

    // Cache combined data for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify({
      results,
      lifetimeStats
    }));

    res.status(200).json({
      message: "Results fetched successfully",
      results,
      lifetimeStats
    });
  } catch (err) {
    console.error('Error fetching results by userId:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.saveProgress = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;
  const { answers } = req.body;

  try {
    let result = await Result.findOne({ test: testId, user: userId });

    if (!result) {
      result = new Result({
        user: userId,
        test: testId,
        answers: [],
        totalMarks: 300
      });
    }

    // Track if we're making actual changes
    let changesMade = false;

    for (let newAns of answers) {
      const existing = result.answers.find(a => 
        a.question.toString() === newAns.question
      );

      if (existing) {
        // Only update if values actually changed
        if (existing.selectedOption !== newAns.selectedOption ||
            existing.markedForReview !== newAns.markedForReview ||
            existing.answeredAndMarkedForReview !== newAns.answeredAndMarkedForReview ||
            existing.visited !== newAns.visited) {
          existing.selectedOption = newAns.selectedOption;
          existing.markedForReview = newAns.markedForReview;
          existing.answeredAndMarkedForReview = newAns.answeredAndMarkedForReview;
          existing.visited = newAns.visited;
          changesMade = true;
        }
      } else {
        result.answers.push(newAns);
        changesMade = true;
      }
    }

    if (!changesMade) {
      return res.status(200).json({ message: 'No changes detected' });
    }

    await result.save();

    // Cache invalidation for affected keys
    const cacheKeysToDelete = [
      // User-specific caches
      `user:${userId}:availableTests`,
      `user:${userId}:attemptedTests`,
      `user:${userId}:results`,
      
      // Result-specific caches
      `result:${testId}:${userId}`,
      `result:${testId}:${userId}:detailed`,

      `user:${userId}:test:${testId}:progress`,  // Progress cache

    ];

    await Promise.all(
      cacheKeysToDelete.map(key => 
        redisClient.del(key).catch(err => 
          console.error(`Failed to delete cache key ${key}:`, err)
        )
    ));

    res.status(200).json({ 
      message: 'Progress saved successfully',
      updatedAt: new Date() 
    });

  } catch (err) {
    console.error('Error saving progress:', err.message);
    res.status(500).json({
      message: 'Error saving progress',
      error: err.message    
    });
  }
};



exports.getTestProgress = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;
  const cacheKey = `user:${userId}:test:${testId}:progress`;

  try {
    // Try cache first
    const cachedProgress = await redisClient.get(cacheKey);
    if (cachedProgress) {
      return res.status(200).json({ 
        message: 'Progress retrieved (cached)',
        progress: JSON.parse(cachedProgress),
        cached: true
      });
    }

    const result = await Result.findOne({ test: testId, user: userId })
      .populate('answers.question');

    if (!result) {
      return res.status(404).json({ message: 'No progress found' });
    }

    const progressData = result.answers.map((ans) => ({
      question: ans.question._id,
      selectedOption: ans.selectedOption,
      numericalAnswer: ans.numericalAnswer,
      markedForReview: ans.markedForReview,
      answeredAndMarkedForReview: ans.answeredAndMarkedForReview,
      visited: ans.visited,
    }));

    // Cache for 30 minutes (shorter TTL than results since progress changes frequently)
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(progressData));

    res.status(200).json({ 
      message: 'Progress retrieved',
      progress: progressData,
      cached: false
    });

  } catch (err) {
    console.error('Error fetching progress:', err.message);
    res.status(500).json({ message: 'Error retrieving progress' });
  }
};



exports.getDetailedResult = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;
  const cacheKey = `result:${testId}:${userId}:detailed`;

  try {
    // Try cache first
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json({
        message: 'Detailed result fetched successfully (cached)',
        ...JSON.parse(cachedResult)
      });
    }

    const result = await Result.findOne({ test: testId, user: userId })
      .populate('answers.question');

    if (!result) {
      return res.status(404).json({ message: 'No result found for this test.' });
    }

    const detailedAnswers = result.answers.map(ans => {
      const q = ans.question;

      return {
        questionId: q._id,
        subject: q.subject,
        questionText: q.text,
        questionImage: q.imageUrl || null,
        options: q.options.map(opt => ({
          label: opt.label,
          text: opt.text,
          imageUrl: opt.imageUrl || null
        })),
        type: q.type,
        selectedOption: ans.selectedOption || null,
        numericalAnswer: ans.numericalAnswer || null,
        correctOption: ans.correctOption || null,
        correctNumericalAnswer: ans.correctNumericalAnswer || null,
        isCorrect: ans.isCorrect,
        visited: ans.visited,
        markedForReview: ans.markedForReview,
        answeredAndMarkedForReview: ans.answeredAndMarkedForReview
      };
    });

    const responseData = {
      testId,
      userId,
      score: result.score,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      unattemptedCount: result.unattemptedCount,
      attemptSummary: result.attemptSummary,
      questions: detailedAnswers
    };

    // Cache for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json({
      message: 'Detailed result fetched successfully',
      ...responseData
    });

  } catch (error) {
    console.error('Error getting detailed result:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





