
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');


//GET /api/user/profile
router.get('/profile', protect, getUserProfile);
//POST /api/user/update
router.post('/update', protect, updateUserProfile);

module.exports = router;