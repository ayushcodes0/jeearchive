const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const {submitTest} = require('../controllers/resultController');

// POST /api/result/submit
router.post('/submit', protect, submitTest);

module.exports = router;