/* 

  This is the rateLimiter page it is used to minimize the chances of getting problems when someone hitting the same api again and again
  It only allow 100 api hits in 15 minutes

*/

// importing espress ratelimit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: 'Too many requests, please try again later.',
});

module.exports = limiter;
