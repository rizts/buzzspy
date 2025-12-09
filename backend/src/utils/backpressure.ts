import type { StreamEvent, ClientConnection } from '../types/index.js';
import { logger } from './logger.js';
import { CONFIG } from '../config/index.js';

export class BackpressureController {
  private eventQueue: StreamEvent[] = [];
  private clients: Map<string, ClientConnection> = new Map();
  private droppedEvents = 0;
  private totalEvents = 0;

  addClient(id: string, reply: any): void {
    this.clients.set(id, {
      id,
      reply,
      connected_at: Date.now(),
      last_activity: Date.now(),
      events_sent: 0,
    });
    
    logger.info(`Client ${id} connected. Total clients: ${this.clients.size}`);
  }

  removeClient(id: string): void {
    const client = this.clients.get(id);
    if (client) {
      this.clients.delete(id);
      logger.info(`Client ${id} disconnected. Events sent: ${client.events_sent}`);
    }
  }

  enqueueEvent(event: StreamEvent): void {
    this.totalEvents++;

    // Apply backpressure if queue is too large
    if (this.eventQueue.length >= CONFIG.streaming.backpressureThreshold) {
      // Drop oldest events (FIFO)
      const dropped = this.eventQueue.shift();
      this.droppedEvents++;
      
      if (this.droppedEvents % 10 === 0) {
        logger.warn(`⚠️  Backpressure active: ${this.droppedEvents} events dropped`);
      }
    }

    // Priority: buzzer_alert > trending > tweet > metrics
    if (event.type === 'buzzer_alert') {
      this.eventQueue.unshift(event); // High priority
    } else {
      this.eventQueue.push(event);
    }
  }

  processQueue(): void {
    if (this.clients.size === 0 || this.eventQueue.length === 0) {
      return;
    }

    // Calculate events per client to maintain overall rate limit
    const eventsPerClient = Math.min(
      5, // Max 5 events per batch per client
      Math.ceil(this.eventQueue.length / this.clients.size)
    );

    const deadClients: string[] = [];

    for (const [clientId, client] of this.clients.entries()) {
      // Send batch of events to this client
      for (let i = 0; i < eventsPerClient && this.eventQueue.length > 0; i++) {
        const event = this.eventQueue.shift()!;
        
        try {
          // SSE format
          const sseData = `data: ${JSON.stringify(event)}\n\n`;
          client.reply.raw.write(sseData);
          
          client.events_sent++;
          client.last_activity = Date.now();
        } catch (error) {
          logger.error(`Failed to send event to client ${clientId}:`, error);
          deadClients.push(clientId);
          break;
        }
      }
    }

    // Clean up dead connections
    deadClients.forEach(id => this.removeClient(id));
  }

  getMetrics() {
    const now = Date.now();
    const activeClients = Array.from(this.clients.values()).filter(
      c => now - c.last_activity < 60000 // Active in last 60s
    ).length;

    return {
      total_clients: this.clients.size,
      active_clients: activeClients,
      queue_size: this.eventQueue.length,
      dropped_events: this.droppedEvents,
      total_events: this.totalEvents,
      drop_rate: this.totalEvents > 0 ? (this.droppedEvents / this.totalEvents * 100).toFixed(2) + '%' : '0%',
    };
  }

  // Cleanup stale connections
  cleanupStaleConnections(): void {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [clientId, client] of this.clients.entries()) {
      if (now - client.last_activity > staleThreshold) {
        logger.warn(`Removing stale client ${clientId}`);
        this.removeClient(clientId);
      }
    }
  }
}

export const backpressureController = new BackpressureController();