const Question = require('../models/Questions');
const Result = require('../models/Result');

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

        const {testId} = req.params;
        const userId = req.user.id;

        const result = await Result.findOne({ user: userId, test: testId})
        .populate('test', 'title description')
        .populate({
            path: 'answers.question',
            select: 'questionText questionImage options correctAnswer subject type'
        });

        if(!result){
            return res.status(404).json({
                message: 'Result not found for this test'
            })
        }

        res.status(200).json({
            message: 'Result fetched successfully',
            result
        })
        
    } catch (err) {
        console.error('Error fetching result by testId:', err.message);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}
    exports.getAllResultsForUser = async (req, res) => {
        try {
            const userId = req.user.id;

            const results = await Result.find({ user: userId })
            .populate('test', 'title date shift')
            .sort({ createdAt: -1 });

            // Aggregate lifetime stats
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

            res.status(200).json({ results, lifetimeStats });
        } catch (err) {
            console.error('Error fetching user results:', err.message);
            res.status(500).json({ message: 'Server error' });
        }
    };


exports.getResultsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const results = await Result.find({ user: userId })
      .populate('test', 'title date shift')
      .sort({ createdAt: -1 });

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

    res.status(200).json({message: "Result fetched successfull according to userId", results, lifetimeStats });
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
      // create empty result on first save
      result = new Result({
        user: userId,
        test: testId,
        answers: [],
        totalMarks: 300
      });
    }

    // Update or push answers
    for (let newAns of answers) {
      const existing = result.answers.find(a => a.question.toString() === newAns.question);

      if (existing) {
        existing.selectedOption = newAns.selectedOption;
        existing.markedForReview = newAns.markedForReview;
        existing.answeredAndMarkedForReview = newAns.answeredAndMarkedForReview;
        existing.visited = newAns.visited;
      } else {
        result.answers.push(newAns);
      }
    }

    await result.save();

    res.status(200).json({ message: 'Progress saved successfully' });
  } catch (err) {
    console.error('Error saving progress:', err.message);
    res.status(500).json({
        message : 'Error saving progress'    
    });
  }
};



exports.getTestProgress = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;

  try {
    const result = await Result.findOne({ test: testId, user: userId }).populate('answers.question');

    if (!result) {
      return res.status(404).json({ message: 'No progress found for this test.' });
    }

    // Only return progress-related data
    const progressData = result.answers.map((ans) => ({
      question: ans.question._id,
      selectedOption: ans.selectedOption,
      numericalAnswer: ans.numericalAnswer,
      markedForReview: ans.markedForReview,
      answeredAndMarkedForReview: ans.answeredAndMarkedForReview,
      visited: ans.visited,
    }));

    res.status(200).json({message: "Successfully fetched progress data", testId, userId, progress: progressData });
  } catch (err) {
    console.error('Error fetching progress:', err.message);
    res.status(500).json({ message: 'Error retrieving progress' });
  }
};



exports.getDetailedResult = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;

  try {
    const result = await Result.findOne({ test: testId, user: userId }).populate('answers.question');

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
        type: q.type, // numerical or objective
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

    res.status(200).json({
      testId,
      userId,
      score: result.score,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      unattemptedCount: result.unattemptedCount,
      attemptSummary: result.attemptSummary,
      questions: detailedAnswers
    });

  } catch (error) {
    console.error('Error getting detailed result:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};






