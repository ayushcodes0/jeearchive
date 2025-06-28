
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');

// Example: GET /api/user/profile
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    message: 'Protected route accessed ✅',
    user: req.user
  });
});

module.exports = router;