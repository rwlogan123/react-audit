// backend/middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');

// Create different rate limiters for different endpoints
const createLimiter = (maxRequests = 100, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: { 
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: windowMinutes 
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific limiters for different routes
const auditLimiter = createLimiter(10, 60); // 10 audits per hour
const contentLimiter = createLimiter(50, 60); // 50 content requests per hour
const authLimiter = createLimiter(5, 15); // 5 auth attempts per 15 minutes
const generalLimiter = createLimiter(100, 15); // 100 general requests per 15 minutes

module.exports = {
  createLimiter,
  auditLimiter,
  contentLimiter,
  authLimiter,
  generalLimiter
};