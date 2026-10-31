/**
 * server/middleware/rateLimiter.js
 * Express Rate Limiting Configurations
 */

const { rateLimit } = require("express-rate-limit");

// Protect auth routes against brute-force credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Max 15 attempts per IP per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login/registration attempts. Please wait 15 minutes before trying again.",
  },
});

// Protect heavy calculation endpoints
const optimizeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many optimization requests. Please wait a moment.",
  },
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 180,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Rate limit exceeded. Please slow down your requests.",
  },
});

module.exports = {
  authLimiter,
  optimizeLimiter,
  apiLimiter,
};

