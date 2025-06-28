
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createQuestion, bulkUploadQuestions } = require('../controllers/questionController');

// POST /api/questions
router.post('/', protect, adminOnly, createQuestion);
// POST /api/questions/bulk
router.post('/bulk', protect, adminOnly, bulkUploadQuestions);

module.exports = router;