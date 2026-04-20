// ============================================
// InstaCart AI — Global Error Handler
// ============================================
// Catches all unhandled errors and returns a safe JSON response.

const config = require('../config/env');

/**
 * Express error-handling middleware (4 args signature).
 * In production, stack traces are hidden from the client.
 */
function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} — ${message}`);
  if (config.isDev) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: statusCode,
    error: statusCode >= 500 ? 'Internal Server Error' : message,
    ...(config.isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
