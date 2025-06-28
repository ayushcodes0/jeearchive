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