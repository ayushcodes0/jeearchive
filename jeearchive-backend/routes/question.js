
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createQuestion, bulkUploadQuestions, getQuestionsForTest } = require('../controllers/questionController');

// POST /api/questions
router.post('/', protect, adminOnly, createQuestion);
// POST /api/questions/bulk
router.post('/bulk', protect, adminOnly, bulkUploadQuestions);
// GET /api/questions/test/:testId
router.get('/test/:testId', protect, getQuestionsForTest);


module.exports = router;