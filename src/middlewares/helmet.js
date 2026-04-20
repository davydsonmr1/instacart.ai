// ============================================
// InstaCart AI — Helmet Security Headers
// ============================================
// Applies strict HTTP security headers including CSP.

const helmet = require('helmet');

/**
 * Returns a pre-configured helmet middleware.
 * Enforces Content-Security-Policy, HSTS, X-Content-Type-Options, etc.
 */
function helmetMiddleware() {
  return helmet({
    // Content Security Policy — restrict what the browser can load
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],  // inline styles needed for emails/widgets
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },

    // Strict-Transport-Security — force HTTPS for 1 year
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },

    // Prevent MIME type sniffing
    xContentTypeOptions: true,

    // Disable X-Powered-By to avoid fingerprinting
    hidePoweredBy: true,

    // Prevent click-jacking
    frameguard: { action: 'deny' },

    // XSS filter (legacy but still useful)
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
}

module.exports = helmetMiddleware;
