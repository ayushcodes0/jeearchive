const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const {submitTest, getResultByTestId} = require('../controllers/resultController');

// POST /api/result/submit
router.post('/submit', protect, submitTest);
// POST /api/result/test/:testId
router.get('/test/:testId', protect, getResultByTestId);

module.exports = router;