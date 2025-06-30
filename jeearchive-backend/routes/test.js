
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createTest, getAllTests, getAvailableTestsForUser, getAttemptedTestsForUser, getTestInstructions, getTestQuestions } = require('../controllers/testController');

// POST /api/test
router.post('/', protect, adminOnly, createTest);
router.get('/', protect, getAllTests);
// GET /api/test
router.get('/user/available', protect, getAvailableTestsForUser);
// GET /api/test
router.get('/user/attempted',protect, getAttemptedTestsForUser);
// GET api/test/:testId/instructions
router.get('/:testId/instructions', protect, getTestInstructions);
// GET api/test/:testId/questions
router.get('/:testId/questions', protect, getTestQuestions);


module.exports = router;
