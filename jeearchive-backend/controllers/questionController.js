
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

exports.bulkUploadQuestions = async (req, res) => {
    try {

        const questions = req.body.questions; // Expecting an array of question objects

        if(!Array.isArray(questions)){
            return res.status(400).json({
                message: 'questions should be an array'
            });
        }

        const inserted = await Question.insertMany(questions);

        res.status(201).json({
            message: `${inserted.length} questions added successfully`,
            inserted 
        });
        
    } catch (err) {
        console.error('Error in bulk upload: ', err.message);
        res.status(500).json({
            message: 'Internal Server Error During Bulk Upload',
            error: err.message
        });
        
    }
}