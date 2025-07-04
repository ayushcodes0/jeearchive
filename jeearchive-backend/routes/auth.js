/* 

    This is my auth.js inside routes.
    It contains all the routes related to auth

*/

// importing express, express router, {register, login, getMe} functions, protect function
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middlewares/auth');
const { googleAuthRedirect, googleCallback } = require('../controllers/googleAuthController');

// POST /api/auth/register
router.post('/register', register);
// POST /api/auth/login
router.post('/login', login);
// GET /api/auth/me
router.get('/me', protect, getMe);

router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleCallback);


module.exports = router;