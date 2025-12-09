import type { FastifyInstance } from 'fastify';
import { streamController } from '../controllers/stream.controller.js';

export async function registerRoutes(app: FastifyInstance) {
  // Health check
  app.get('/health', streamController.health.bind(streamController));

  // SSE stream endpoint
  app.get('/api/stream', streamController.handleSSE.bind(streamController));

  // Control endpoints
  app.post('/api/stream/start', streamController.startStream.bind(streamController));
  app.post('/api/stream/stop', streamController.stopStream.bind(streamController));
  app.get('/api/stream/status', streamController.getStatus.bind(streamController));

  // Root endpoint
  app.get('/', async (request, reply) => {
    return {
      service: 'BuzzSpy Backend',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: 'GET /health',
        stream: 'GET /api/stream',
        start: 'POST /api/stream/start',
        stop: 'POST /api/stream/stop',
        status: 'GET /api/stream/status',
      },
    };
  });
}