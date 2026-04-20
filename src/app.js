// ============================================
// InstaCart AI — Express Application
// ============================================
// Configures Express with all security middlewares.
// Exported separately from server.js for testability.

const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const helmetMiddleware = require('./middlewares/helmet');
const globalLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const registerRoutes = require('./routes');

// ── Create Express App ──────────────────────
const app = express();

// ── Trust Proxy (required behind Render/Railway/Vercel) ──
if (config.isProd) {
  app.set('trust proxy', 1);
}

// ── Security Headers (Helmet) ───────────────
app.use(helmetMiddleware());

// ── CORS ────────────────────────────────────
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // pre-flight cache: 24h
  })
);

// ── Rate Limiting ───────────────────────────
app.use(globalLimiter);

// ── Body Parsing ────────────────────────────
app.use(express.json({ limit: '10kb' }));          // prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Routes ──────────────────────────────────
registerRoutes(app);

// ── 404 Catch-All ───────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: 'O recurso solicitado não existe.',
  });
});

// ── Global Error Handler ────────────────────
app.use(errorHandler);

module.exports = app;
