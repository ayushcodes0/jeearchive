const Test = require('../models/Test');
const Result = require('../models/Result');
const Question = require('../models/Questions');
const redisClient = require('../utils/redisClient');

exports.createTest = async (req, res) => {
  try {
    const { title, duration, totalMarks, instructions, date, shift } = req.body;

    const test = await Test.create({
      title,
      duration,
      totalMarks,
      instructions,
      date,
      shift,
      createdBy: req.user.id
    });

    // Invalidate cache
    await redisClient.del('tests:all');

    res.status(201).json({
      message: 'Test created successfully',
      test
    });

  } catch (err) {
    console.error('Error creating test:', err.message);
    res.status(500).json({
      message: 'Error creating test',
      error: err.message
    });
  }
};


exports.getAllTests = async (req, res) => {
  try {
    const cacheKey = 'tests:all';

    // Check if cached
    const cachedTests = await redisClient.get(cacheKey);
    if (cachedTests) {
      return res.status(200).json({
        message: 'Tests fetched successfully (cached)',
        tests: JSON.parse(cachedTests),
      });
    }

    // Fetch from DB if not cached
    const tests = await Test.find().sort({ createdAt: -1 });

    // Store in Redis cache for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(tests));

    res.status(200).json({
      message: 'Tests fetched successfully',
      tests,
    });

  } catch (err) {
    console.error('Error fetching tests:', err.message);
    res.status(500).json({
      message: 'Error fetching tests',
      error: err.message,
    });
  }
};

exports.getAvailableTestsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:availableTests`;

    // 1. Check Redis cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return res.status(200).json({
        message: "Fetched successfully all the tests (cached)",
        count: parsed.length,
        tests: parsed
      });
    }

    // 2. If not in cache, fetch attempted test IDs
    const attemptedResults = await Result.find({ user: userId }).select('test');
    const attemptedTestIds = attemptedResults.map(result => result.test.toString());

    // 3. Fetch available tests from DB
    const availableTests = await Test.find({
      _id: { $nin: attemptedTestIds }
    }).sort({ date: -1 });

    // 4. Cache for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(availableTests));

    // 5. Send response
    res.status(200).json({
      message: "Fetched successfully all the tests",
      count: availableTests.length,
      tests: availableTests
    });

  } catch (err) {
    console.log("Error fetching available tests:", err.message);
    res.status(500).json({
      message: "Failed to fetch available tests"
    });
  }
};

exports.getAttemptedTestsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:attemptedTests`;

    // 1. Try to fetch from Redis cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return res.status(200).json({
        message: "Successfully fetched attempted test (cached)",
        count: parsed.length,
        attemptedTests: parsed
      });
    }

    // 2. Not cached - fetch from DB
    const attempted = await Result.find({ user: userId })
      .populate({
        path: 'test',
        select: 'title date shift subject duration',
      })
      .sort({ createdAt: -1 });

    const mappedResults = attempted.map((result) => ({
      test: result.test,
      score: result.score,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      unattempted: result.unattempted,
      submittedAt: result.createdAt,
    }));

    // 3. Cache the result for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(mappedResults));

    // 4. Return response
    res.status(200).json({
      message: "Successfully fetched attempted test",
      count: mappedResults.length,
      attemptedTests: mappedResults
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch attempted tests' });
  }
};


exports.getTestInstructions = async (req, res) => {
  try {
    const { testId } = req.params;
    const cacheKey = `test:${testId}:instructions`;

    // 1. Try fetching from cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        message: 'Test instructions fetched successfully (cached)',
        ...JSON.parse(cachedData)
      });
    }

    // 2. If not in cache, fetch from DB
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const instructionsData = {
      testId,
      title: test.title,
      duration: test.duration,
      totalMarks: test.totalMarks,
      instructions: test.instructions,
      subjectWiseSectionCount: test.subjectWiseSectionCount,
      date: test.date,
      shift: test.shift
    };

    // 3. Cache the result for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(instructionsData));

    res.status(200).json({
      message: 'Test instructions fetched successfully',
      ...instructionsData
    });

  } catch (err) {
    console.error('Error fetching test instructions:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getTestQuestions = async (req, res) => {
  try {
    const { testId } = req.params;
    const cacheKey = `test:${testId}:questions`;

    // Try to get from cache first
    const cachedQuestions = await redisClient.get(cacheKey);
    if (cachedQuestions) {
      return res.status(200).json({
        message: "Successfully fetched all test questions (cached)",
        questions: JSON.parse(cachedQuestions)
      });
    }

    // Not in cache, fetch from DB
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const questions = await Question.find({ test: testId }).select('-options.isCorrect -correctAnswer');

    const structured = {
      Physics: { A: [], B: [] },
      Chemistry: { A: [], B: [] },
      Maths: { A: [], B: [] }
    };

    questions.forEach(q => {
      if (structured[q.subject]) {
        structured[q.subject][q.section].push(q);
      }
    });

    // Cache for future requests (1 hour TTL)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(structured));

    res.status(200).json({
      message: "Successfully fetched all test questions",
      testId,
      title: test.title,
      questions: structured
    });
  } catch (err) {
    console.error('Error fetching questions:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.editTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const updates = req.body;

    const updatedTest = await Test.findByIdAndUpdate(testId, updates, { new: true });

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Invalidate all relevant cache entries
    const cacheKeysToDelete = [
      'tests:all', // All tests listing
      `test:${testId}:instructions`, // Test instructions
      `test:${testId}:questions`, // Test questions
    ];

    // Get all user IDs who might have attempted this test or need available tests
    const results = await Result.find({ test: testId }).select('user');
    const userIds = [...new Set(results.map(r => r.user.toString()))];

    // Add user-specific cache keys to delete
    userIds.forEach(userId => {
      cacheKeysToDelete.push(
        `user:${userId}:availableTests`,
        `user:${userId}:attemptedTests`
      );
    });

    // Delete all affected cache entries
    await Promise.all(cacheKeysToDelete.map(key => redisClient.del(key)));

    res.status(200).json({
      message: 'Test updated successfully',
      test: updatedTest
    });
  } catch (err) {
    console.error('Error editing test:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;

    // First get test details (needed for cache invalidation)
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Perform deletion (using parallel execution for efficiency)
    const [deletedTest] = await Promise.all([
      Test.findByIdAndDelete(testId),
      Question.deleteMany({ test: testId }),
      Result.deleteMany({ test: testId })
    ]);

    // Cache keys to invalidate
    const cacheKeysToDelete = [
      'tests:all',                         // Main tests listing
      `test:${testId}:instructions`,       // Test instructions
      `test:${testId}:questions`,          // Test questions
    ];

    // Get ALL affected users (who attempted this test)
    const results = await Result.find({ test: testId }).select('user');
    const userIds = [...new Set(results.map(r => r.user.toString()))];

    // Add user-specific cache keys
    userIds.forEach(userId => {
      cacheKeysToDelete.push(
        `user:${userId}:availableTests`,   // User's available tests
        `user:${userId}:attemptedTests`,  // User's attempted tests
      );
    });

    // Add admin/global cache keys if needed
    cacheKeysToDelete.push(
      'admin:dashboard',                  // Admin dashboard cache
      'leaderboard:global'                // Global leaderboard
    );

    // Execute all cache deletions in parallel
    await Promise.all(
      cacheKeysToDelete.map(key => redisClient.del(key))
    );

    res.status(200).json({ 
      message: 'Test and all related data deleted successfully',
      deletedTestId: testId
    });

  } catch (err) {
    console.error('Error deleting test:', err.message);
    res.status(500).json({ 
      message: 'Failed to delete test',
      error: err.message 
    });
  }
};

