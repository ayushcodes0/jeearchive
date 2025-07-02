/* 

  This is my question controller.
  This page contains the controller related to questions.
  Such as : createQuestion, bulkUploadQuestions, getQuestionsForTest, 

*/

// importing Question model
const Question = require('../models/Questions');
// importing redisClient for caching the data
const redisClient = require('../utils/redisClient');


// this is createQuestion function use to create a particular question
exports.createQuestion = async (req, res) => {
    try {
        const { test, subject, section, questionText, imageUrl, options, correctAnswer, type, marks, negativeMarks } = req.body;

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
        });

        // Invalidate the relevant caches
        const cacheKeysToDelete = [
            `test:${test}:questions`,           // test questions cache
            `test:${test}:questionCount`,       // question count cache if exists
        ];

        await Promise.all(cacheKeysToDelete.map(key => redisClient.del(key)));

        res.status(201).json({
            message: 'Question added successfully',
            question
        });
        
    } catch (err) {
        console.error('Error adding question: ', err.message);
        res.status(500).json({
            message: 'Internal Server Error',
            error: err.message
        });
    }
};


// this is bulkUploadQuestions function use to upload questions in bulk, it is very usefull because it provides us freedom to upload the complete test question in one go.
exports.bulkUploadQuestions = async (req, res) => {
    try {
        const questions = req.body.questions;

        if(!Array.isArray(questions)){
            return res.status(400).json({
                message: 'questions should be an array'
            });
        }

        // Get unique test IDs from the questions being uploaded
        const testIds = [...new Set(questions.map(q => q.test))];

        const inserted = await Question.insertMany(questions);

        // Invalidate caches for all affected tests
        const cacheKeysToDelete = testIds.flatMap(testId => [
            `test:${testId}:questions`,
            `test:${testId}:questionCount`,
        ]);

        await Promise.all(cacheKeysToDelete.map(key => redisClient.del(key)));

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
};


// this is getQuestionsForTest function use to get all the questions which belongs to same test
exports.getQuestionsForTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const cacheKey = `test:${testId}:questions`;

        // Try to get from cache first
        const cachedQuestions = await redisClient.get(cacheKey);
        if (cachedQuestions) {
            return res.status(200).json({
                message: 'Questions fetched successfully (cached)',
                questions: JSON.parse(cachedQuestions)
            });
        }

        // Not in cache, fetch from DB
        const questions = await Question.find({ test: testId }).select(
            '-options.isCorrect -correctAnswer'
        );

        // Cache for future requests (1 hour TTL)
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(questions));

        res.status(200).json({
            message: 'Questions fetched successfully',
            questions
        });
        
    } catch (err) {
        console.error('Error fetching questions for test: ', err.message);
        res.status(500).json({
            message: 'Internal Server Error',
            error: err.message
        });
    }
};
