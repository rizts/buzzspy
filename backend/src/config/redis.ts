import { Redis } from '@upstash/redis';
import { CONFIG } from './index.js';
import { logger } from '../utils/logger.js';

class RedisClient {
  private client: Redis;
  private connected: boolean = false;

  constructor() {
    this.client = new Redis({
      url: CONFIG.redis.url,
      token: CONFIG.redis.token,
    });
  }

  async connect(): Promise<void> {
    try {
      // Test connection
      await this.client.ping();
      this.connected = true;
      logger.info('✅ Connected to Upstash Redis');
    } catch (error) {
      logger.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, JSON.stringify(value));
      } else {
        await this.client.set(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error);
      return 0;
    }
  }

  async push(key: string, value: any): Promise<void> {
    try {
      await this.client.rpush(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Redis RPUSH error for key ${key}:`, error);
    }
  }

  async pop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.lpop(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      logger.error(`Redis LPOP error for key ${key}:`, error);
      return null;
    }
  }

  async listLength(key: string): Promise<number> {
    try {
      return await this.client.llen(key);
    } catch (error) {
      logger.error(`Redis LLEN error for key ${key}:`, error);
      return 0;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const redis = new RedisClient();