/* 

  This is user.js inside routes.
  It contains all the routes related to user

*/

// importing express, express router, protect function, {getUserProfile, updateUserProfile} functions, upload middleware.
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { getUserProfile, updateUserProfile, getAllUsers } = require('../controllers/userController');
const upload = require('../middlewares/upload')
const adminOnly = require('../middlewares/admin');


//GET /api/user/profile
router.get('/profile', protect, getUserProfile);
//POST /api/user/update
router.post('/update', protect, updateUserProfile);
//GET /api/user
router.get('/', protect, adminOnly, getAllUsers)

// PUT /api/user/update-profile
router.put(
  '/update-profile',
  protect,
  upload.single('image'), // image key name in frontend/postman
  updateUserProfile
);

module.exports = router;