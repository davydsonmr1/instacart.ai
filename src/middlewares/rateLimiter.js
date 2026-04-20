// ============================================
// InstaCart AI — Rate Limiter Middleware
// ============================================
// Global rate limiting to mitigate brute-force and DDoS attacks.

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * Global rate limiter.
 * Defaults: 100 requests per 15-minute window.
 * Configurable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX env vars.
 */
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,

  // Use standard 429 status
  standardHeaders: true,  // Return `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers

  // Custom response when limit is exceeded
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.',
  },

  // Trust proxy if behind a reverse proxy (Render, Railway, etc.)
  // Set to true when deploying behind a load balancer
  // validate: { trustProxy: false },
});

module.exports = globalLimiter;
