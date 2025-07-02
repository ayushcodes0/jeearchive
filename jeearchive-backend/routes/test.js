/* 

    This is test.js inside routes.
    It contains all the routes related to test

*/

// importing express, express router, protect function, adminOnly function, { createTest, getAllTests, getAvailableTestsForUser, getAttemptedTestsForUser, getTestInstructions, getTestQuestions, editTest, deleteTest } functions.
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createTest, getAllTests, getAvailableTestsForUser, getAttemptedTestsForUser, getTestInstructions, getTestQuestions, editTest, deleteTest, searchTests } = require('../controllers/testController');

// POST /api/test/
router.post('/', protect, adminOnly, createTest);
// GET /api/test/
router.get('/', protect, getAllTests);
// GET /api/test/user/available
router.get('/user/available', protect, getAvailableTestsForUser);
// GET /api/test/user/attempted
router.get('/user/attempted',protect, getAttemptedTestsForUser);
// GET api/test/:testId/instructions
router.get('/:testId/instructions', protect, getTestInstructions);
// GET api/test/:testId/questions
router.get('/:testId/questions', protect, getTestQuestions);
// PUT api/test/edit/:testId
router.put('/edit/:testId', protect, adminOnly, editTest);
// DELETE api/test/delete/:testId
router.delete('/delete/:testId', protect, adminOnly, deleteTest);
// GET /api/test/search?q=jee%20mains
router.get('/search',protect, searchTests);


module.exports = router;
