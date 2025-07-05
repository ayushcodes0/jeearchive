/* 

  This is my test controller.
  This page contains the controller for test.
  Such as : createTest, getAllTests, getAvailableTestsForUser, getAttemptedTestsForUser, getTestInstructions, getTestQuestions, editTest, deleteTest, 

*/

// importing Test model, Result model, Question model, redisClient
const Test = require('../models/Test');
const Result = require('../models/Result');
const Question = require('../models/Questions');
const redisClient = require('../utils/redisClient');


// this is createTest function used to create a test.
exports.createTest = async (req, res) => {
  try {
    const { title, duration, totalMarks, instructions, date, shift, type } = req.body;

    const test = await Test.create({
      title,
      duration,
      totalMarks,
      instructions,
      date,
      shift,
      type,
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


// this is getAllTests function use to get all the test present in the database.
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


// this is getAvailableTestsForUser function used to get all the available test for a particular user
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


// this is getAttemptedTestsForUser function used to get all the attempted test by the user
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


// this is getTestInstructions function used to get the instruction of a particular test
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


// this is getTestQuestions function used to get the question of a particular test
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


// this is editTest function used to edit the test
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


// this is deleteTest function used to delete a test
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

// this is my search controller used to search different tests
exports.searchTests = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ message: 'Query is required' });

    const skip = (page - 1) * limit;
    const cacheKey = `search:${q}:${page}:${limit}`;

    // Try cache first
    const cachedResults = await redisClient.get(cacheKey);
    if (cachedResults) {
      return res.status(200).json(JSON.parse(cachedResults));
    }

    const query = q.toLowerCase().trim();
    const filters = {};

    // Build $or conditions for flexible search
    const searchConditions = [
      { title: { $regex: query, $options: 'i' } },
      { instructions: { $regex: query, $options: 'i' } }
    ];

    // Special handling for exact matches in quotes
    if (query.startsWith('"') && query.endsWith('"')) {
      const exactPhrase = query.slice(1, -1);
      filters.$or = [
        { title: exactPhrase },
        { instructions: exactPhrase }
      ];
    } else {
      // Use text search for multi-word queries
      if (query.split(' ').length >= 2) {
        filters.$text = { $search: query };
      } else {
        filters.$or = searchConditions;
      }
    }

    // Shift detection
    if (query.includes('shift 1')) filters.shift = 'Shift 1';
    else if (query.includes('shift 2')) filters.shift = 'Shift 2';

    // Date parsing (more robust version)
    const dateMatch = query.match(/(\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})(?:,?\s*)?(\d{4})?)/i);
    if (dateMatch) {
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const [, monthStr, day, year] = dateMatch;
      const month = months[monthStr.toLowerCase().substring(0, 3)];
      const dateYear = year ? parseInt(year) : new Date().getFullYear();
      
      const dateStart = new Date(dateYear, month, parseInt(day));
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateStart.getDate() + 1);
      
      filters.date = { $gte: dateStart, $lt: dateEnd };
    }

    // Execute query with pagination
    const [tests, totalCount] = await Promise.all([
      Test.find(filters)
        .sort(filters.$text ? { score: { $meta: 'textScore' } } : { date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Test.countDocuments(filters)
    ]);

    // Prepare response
    const response = {
      message: 'Search results fetched successfully',
      count: tests.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      tests
    };

    // Cache results for 15 minutes
    await redisClient.setEx(cacheKey, 900, JSON.stringify(response));

    res.status(200).json(response);

  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
};

