
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createQuestion } = require('../controllers/questionController');

// POST /api/questions
router.post('/', protect, adminOnly, createQuestion);

module.exports = router;