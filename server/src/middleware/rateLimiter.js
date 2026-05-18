const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const reportSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // 5 submissions per hour
  message: {
    success: false,
    message: 'Too many reports submitted from this connection. ' +
             'Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Daily-rotating hash — IP never stored permanently
  keyGenerator: (req) => {
    return crypto
      .createHash('sha256')
      .update((req.ip || 'unknown') + new Date().toDateString())
      .digest('hex');
  },
  validate: {
    ip: false,
    keyGeneratorIpFallback: false
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 OTP requests per 10 minutes
  message: {
    success: false,
    message: 'Too many verification requests. Please wait before trying again.'
  }
});

module.exports = { reportSubmissionLimiter, authLimiter, otpLimiter };
