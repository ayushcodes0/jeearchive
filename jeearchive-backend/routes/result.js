const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/auth');
const {submitTest, getResultByTestId, getAllResultsForUser, getResultsByUserId} = require('../controllers/resultController');

// POST /api/result/submit
router.post('/submit', protect, submitTest);
// POST /api/result/test/:testId
router.get('/test/:testId', protect, getResultByTestId);
// GET /api/result/my
router.get('/my', protect, getAllResultsForUser);
// GET /api/result/user/:userId
router.get('/user/:userId', protect, adminOnly, getResultsByUserId)

module.exports = router;