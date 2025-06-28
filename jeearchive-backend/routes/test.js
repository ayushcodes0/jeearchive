
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const { createTest } = require('../controllers/testController');

// POST /api/tests
router.post('/', protect, adminOnly, createTest);

module.exports = router;
