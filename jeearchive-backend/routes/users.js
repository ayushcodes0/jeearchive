
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const upload = require('../middlewares/upload')


//GET /api/user/profile
router.get('/profile', protect, getUserProfile);
//POST /api/user/update
router.post('/update', protect, updateUserProfile);

// PUT /api/user/update-profile
router.put(
  '/update-profile',
  protect,
  upload.single('image'), // image key name in frontend/postman
  updateUserProfile
);

module.exports = router;