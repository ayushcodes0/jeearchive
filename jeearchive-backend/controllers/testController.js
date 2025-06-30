const Test = require('../models/Test');
const Result = require('../models/Result');
const Question = require('../models/Questions');

exports.createTest = async (req, res) => {
    try {

        const {title, duration, totalMarks, instructions, date, shift} = req.body;

        const test = await Test.create({
            title,
            duration,
            totalMarks,
            instructions,
            date,
            shift,
            createdBy: req.user.id  // from auth middleware
        });

        res.status(201).json({
            message: 'Test created successfully',
            test
        });
        
    } catch (err) {
        console.error('Error creating test:', err.message);
        res.status(500).json({
            message: 'Error creating test',
            error: err.message
        })
        
    }
}

exports.getAllTests = async (req, res) =>{
    try {

        const tests = await Test.find().sort({createdAt: -1}); // latest tests first
        res.status(200).json({
            message: 'Tests fetched successfully',
            tests
        });
        
    } catch (err) {
        console.error('Error fetching tests:', err.message);
        res.status(500).json({
            message: 'Error fetching tests',
            error: err.message
        });
    }
}

exports.getAvailableTestsForUser = async (req,res) =>{
    try {

        const userId = req.user.id;

        const attemptedResults = await Result.find({user: userId}).select('test');
        const attemptedTestIds = await attemptedResults.map((result) => result.test.toString());

        const availableTests = await Test.find({
            _id: {$nin: attemptedTestIds},
        }).sort({date: -1});

        res.status(200).json({
            message: "Fetched successfully all the tests",
            count: availableTests.length,
            tests: availableTests
        });
        
    } catch (err) {
        console.log("Error fetching available tests:", err.message);
        res.status(500).json({
            message: "Failed to fetch available tests"
        })
    }
}

exports.getAttemptedTestsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all results by the user, and populate test info
    const attempted = await Result.find({ user: userId })
      .populate({
        path: 'test',
        select: 'title date shift subject duration',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
        message: "Successfully fetched attempted test",
        count: attempted.length,
        attemptedTests: attempted.map((result) => ({
        test: result.test,
        score: result.score,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        unattempted: result.unattempted,
        submittedAt: result.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch attempted tests' });
  }
};


exports.getTestInstructions = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const { title, duration, totalMarks, instructions, subjectWiseSectionCount, date, shift } = test;

    res.status(200).json({
      testId,
      title,
      duration,
      totalMarks,
      instructions,
      subjectWiseSectionCount,
      date,
      shift
    });
  } catch (err) {
    console.error('Error fetching test instructions:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getTestQuestions = async (req, res) => {
  try {
    const { testId } = req.params;

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

