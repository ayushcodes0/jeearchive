
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createTest, getAllTests, getAvailableTestsForUser, getAttemptedTestsForUser, getTestInstructions, getTestQuestions, editTest, deleteTest } = require('../controllers/testController');

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
// PUT api/test
router.put('/edit/:testId', protect, adminOnly, editTest);

// Delete api/test
router.delete('/delete/:testId', protect, adminOnly, deleteTest);


module.exports = router;
