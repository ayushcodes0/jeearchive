
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createQuestion, bulkUploadQuestions, getQuestionsForTest } = require('../controllers/questionController');

// POST /api/question
router.post('/', protect, adminOnly, createQuestion);
// POST /api/question/bulk
router.post('/bulk', protect, adminOnly, bulkUploadQuestions);
// GET /api/question/test/:testId
router.get('/test/:testId', protect, getQuestionsForTest);


module.exports = router;