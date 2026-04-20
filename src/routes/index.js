// ============================================
// InstaCart AI — Route Aggregator
// ============================================
// Registers all route modules on the Express app.

const healthRoutes = require('./health');

/**
 * Mounts all route modules.
 * @param {import('express').Application} app
 */
function registerRoutes(app) {
  // ── Public ────────────────────────────────
  app.use(healthRoutes);

  // ── API v1 (future) ───────────────────────
  // app.use('/api/v1/auth',  authRoutes);
  // app.use('/api/v1/carts', cartRoutes);
  // app.use('/api/v1/ai',    aiRoutes);
}

module.exports = registerRoutes;
