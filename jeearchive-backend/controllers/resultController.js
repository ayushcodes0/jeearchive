const Question = require('../models/Questions');
const Result = require('../models/Result');

exports.submitTest = async (req, res) => {
    try {

        const {testId, answers} = req.body;  // submitted answers
        const userId = req.user.id;

        const questions = await Question.find({ test: testId});

        let score = 0;
        let correct = 0;
        let wrong = 0;
        let unattempted = 0;

        const detailedAnswers = [];

        for (const question of questions){
            const userAnswer = answers.find(ans => ans.questionId === question._id.toString());

            if(!userAnswer){
                unattempted++;
                continue;
            }

            const ansObj = {
                question: question._id,
                selectedOption: userAnswer.selectedOption || null,
                numericalAnswer: userAnswer.numericalAnswer || null,
                correctOption: null,
                correctNumericalAnswer: null,
                isCorrect: false
            }

            let isCorrect = false;

            if(question.type === 'mcq'){
                const correctOpt = question.options.find(opt => opt.isCorrect);
                ansObj.correctOption = correctOpt?.label;

                if(userAnswer.selectedOption === correctOpt?.label){
                    isCorrect = true;
                }
            }
            else if(question.type === 'numerical'){
                ansObj.correctNumericalAnswer = question.correctAnswer;

                if(userAnswer.numericalAnswer && userAnswer.numericalAnswer.toString().trim() === question.correctAnswer){
                    isCorrect = true;
                }
            }

            ansObj.isCorrect = isCorrect;

            if(isCorrect){
                score += question.marks;
                correct++;
            }
            else{
                if(userAnswer.selectedOption || userAnswer.numericalAnswer){
                    score -= question.negativeMarks || 0;
                    wrong++;
                }
                else{
                    unattempted++;
                }
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
            unattemptedCount: unattempted
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
}


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



