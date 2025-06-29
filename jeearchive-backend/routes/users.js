
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { getUserProfile } = require('../controllers/userController');


//GET /api/user/profile
router.get('/profile', protect, getUserProfile);

module.exports = router;