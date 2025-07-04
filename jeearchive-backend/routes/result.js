/* 

    This is result.js inside routes.
    It contains all the routes related to result.

*/

// importing express, express router, protect function, adminOnly function, {submitTest, getResultByTestId, getAllResultsForUser, getResultsByUserId, saveProgress, getTestProgress, getDetailedResult} functions.
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/auth');
const {submitTest, getResultByTestId, getAllResultsForUser, getResultsByUserId, saveProgress, getTestProgress, getDetailedResult} = require('../controllers/resultController');

// POST /api/result/submit
router.post('/submit', protect, submitTest);
// POST /api/result/test/:testId
router.get('/test/:testId', protect, getResultByTestId);
// GET /api/result/my
router.get('/my', protect, getAllResultsForUser);
// GET /api/result/user/:userId
router.get('/user/:userId', protect, adminOnly, getResultsByUserId)
// POST /api/result/save-progress/:testId
router.post('/save-progress/:testId', protect, saveProgress);
// GET /api/result/progress/:testId
router.get('/progress/:testId', protect, getTestProgress);
// GET /api/result/details/:testId
router.get('/details/:testId', protect, getDetailedResult);


module.exports = router;