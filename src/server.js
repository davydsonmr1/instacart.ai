// ============================================
// InstaCart AI — Server Entry Point
// ============================================
// Boots the HTTP server and handles graceful shutdown.

const app = require('./app');
const config = require('./config/env');

const server = app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║        🛒  InstaCart AI  Backend         ║
  ╠══════════════════════════════════════════╣
  ║  Status:  ONLINE                        ║
  ║  Port:    ${String(config.port).padEnd(32)}║
  ║  Env:     ${String(config.env).padEnd(32)}║
  ║  Health:  http://localhost:${config.port}/health    ║
  ╚══════════════════════════════════════════╝
  `);
});

// ── Graceful Shutdown ───────────────────────
function shutdown(signal) {
  console.log(`\n[${signal}] Desligando servidor graciosamente...`);
  server.close(() => {
    console.log('[SERVER] Conexões encerradas. Até logo! 👋');
    process.exit(0);
  });

  // Force exit after 10s if connections hang
  setTimeout(() => {
    console.error('[SERVER] Forçando encerramento após timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Unhandled Errors ────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason);
  // In production you may want to crash + restart via process manager
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  process.exit(1);
});
