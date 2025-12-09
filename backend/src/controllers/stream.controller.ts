import type { FastifyRequest, FastifyReply } from 'fastify';
import { backpressureController } from '../utils/backpressure.js';
import { streamService } from '../services/stream.service.js';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';

export class StreamController {
  // SSE endpoint for tweet streaming
  async handleSSE(request: FastifyRequest, reply: FastifyReply) {
    const clientId = randomUUID();
    
    // Set SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Send initial connection event
    reply.raw.write(`data: ${JSON.stringify({ type: 'connected', client_id: clientId })}\n\n`);

    // Register client
    backpressureController.addClient(clientId, reply);
    
    logger.info(`SSE client ${clientId} connected`);

    // Keep-alive ping every 30 seconds
    const keepAlive = setInterval(() => {
      try {
        reply.raw.write(': ping\n\n');
      } catch (error) {
        logger.error(`Keep-alive failed for client ${clientId}`);
        clearInterval(keepAlive);
      }
    }, 30000);

    // Handle client disconnect
    request.raw.on('close', () => {
      clearInterval(keepAlive);
      backpressureController.removeClient(clientId);
      logger.info(`SSE client ${clientId} disconnected`);
    });
  }

  // Start/stop streaming
  async startStream(request: FastifyRequest, reply: FastifyReply) {
    try {
      await streamService.start();
      
      return reply.send({
        success: true,
        message: 'Stream started',
        status: streamService.getStatus(),
      });
    } catch (error) {
      logger.error('Failed to start stream:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to start stream',
      });
    }
  }

  async stopStream(request: FastifyRequest, reply: FastifyReply) {
    streamService.stop();
    
    return reply.send({
      success: true,
      message: 'Stream stopped',
    });
  }

  // Get stream status
  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      data: streamService.getStatus(),
    });
  }

  // Health check
  async health(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}

export const streamController = new StreamController();