
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createTest, getAllTests } = require('../controllers/testController');

// POST /api/tests
router.post('/', protect, adminOnly, createTest);
router.get('/', protect, getAllTests);

module.exports = router;
