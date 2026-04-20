// ============================================
// InstaCart AI — Centralized Environment Config
// ============================================
// Single source of truth for all env-based settings.
// Validates required variables at boot time.

require('dotenv').config();

const config = {
  // ── Server ──────────────────────────────────
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  get isDev() {
    return this.env === 'development';
  },
  get isProd() {
    return this.env === 'production';
  },

  // ── CORS ────────────────────────────────────
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3000'],

  // ── Rate Limiting ───────────────────────────
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // ── Supabase ────────────────────────────────
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // ── Groq AI ─────────────────────────────────
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
  },
};

module.exports = config;
