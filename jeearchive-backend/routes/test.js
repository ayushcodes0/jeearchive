
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createTest, getAllTests, getAvailableTestsForUser, getAttemptedTestsForUser } = require('../controllers/testController');

// POST /api/test
router.post('/', protect, adminOnly, createTest);
router.get('/', protect, getAllTests);
// GET /api/test
router.get('/user/available', protect, getAvailableTestsForUser);
// GET /api/test
router.get('/user/attempted',protect, getAttemptedTestsForUser);

module.exports = router;
