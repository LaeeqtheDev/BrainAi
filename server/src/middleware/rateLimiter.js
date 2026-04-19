const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
  },
});

/**
 * Chat rate limiter (for AI calls)
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: {
    success: false,
    error: 'Slow down! You can send up to 10 messages per minute',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  chatLimiter,
};