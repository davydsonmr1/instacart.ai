// ============================================
// InstaCart AI — Health Check Route
// ============================================
// Lightweight endpoint for monitoring tools (UptimeRobot, etc.)

const { Router } = require('express');

const router = Router();

/**
 * GET /health
 * Returns 200 OK with uptime and timestamp.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
