const rateLimit = require('express-rate-limit');

// General API limiter — all routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again after 15 minutes' },
});

// Strict limiter for auth routes — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  skipSuccessfulRequests: true, // Only count failed attempts
});

module.exports = { apiLimiter, authLimiter };
