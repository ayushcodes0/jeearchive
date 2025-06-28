
const Question = require('../models/Questions');

exports.createQuestion = async (req, res) => {
    try {

        const {test, subject, section, questionText, imageUrl, options, correctAnswer, type, marks, negativeMarks} = req.body;

        const question = await Question.create({
            test,
            subject,
            section,
            questionText,
            imageUrl,
            options,
            correctAnswer,
            type,
            marks,
            negativeMarks
        })

        res.status(201).json({
            message: 'Question added successfully',
            question
        })
        
    } catch (err) {
        console.error('Error adding question: ', err.message);
        res.status(500).json({
            message: 'Internal Server Error',
            error: err.message
        })
    }
}