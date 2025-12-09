import Fastify from 'fastify';
import cors from '@fastify/cors';
import { CONFIG } from './config/index.js';
import { redis } from './config/redis.js';
import { logger } from './utils/logger.js';
import { registerRoutes } from './routes/index.js';
import { setupReplitKeepAlive, logReplitEnvironment } from './config/replit.js';

const app = Fastify({
  logger: logger as any,
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  trustProxy: true,
});

// Register CORS
await app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

// Register routes
await registerRoutes(app);

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
  process.on(signal, async () => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    
    try {
      await app.close();
      logger.info('✅ Server closed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
});

// Start server
async function start() {
  try {
    // Connect to Redis
    await redis.connect();

    // Start server
    await app.listen({
      port: CONFIG.server.port,
      host: CONFIG.server.host,
    });

    logger.info(`
    ┌─────────────────────────────────────┐
    │   🚀 BuzzSpy Backend Running        │
    ├─────────────────────────────────────┤
    │   Host: ${CONFIG.server.host.padEnd(26)}│
    │   Port: ${CONFIG.server.port.toString().padEnd(26)}│
    │   Env:  ${CONFIG.server.env.padEnd(26)}│
    └─────────────────────────────────────┘
    `);

    logger.info('📡 Endpoints:');
    logger.info(`   SSE Stream:  http://localhost:${CONFIG.server.port}/api/stream`);
    logger.info(`   Start:       POST http://localhost:${CONFIG.server.port}/api/stream/start`);
    logger.info(`   Stop:        POST http://localhost:${CONFIG.server.port}/api/stream/stop`);
    logger.info(`   Status:      GET http://localhost:${CONFIG.server.port}/api/stream/status`);
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();