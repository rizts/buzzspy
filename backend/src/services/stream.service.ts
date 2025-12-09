import type { Tweet, StreamEvent, SystemMetrics } from '../types/index.js';
import { mockDataGenerator } from './mock-data.service.js';
import { backpressureController } from '../utils/backpressure.js';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { CONFIG } from '../config/index.js';

class StreamService {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  private tweetCount = 0;
  private startTime = Date.now();

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Stream already running');
      return;
    }

    this.isRunning = true;
    this.startTime = Date.now();
    logger.info('🚀 Starting tweet stream...');

    // Generate tweets at configured rate
    const intervalMs = 1000 / CONFIG.streaming.tweetsPerSecond;
    
    this.interval = setInterval(() => {
      if (!this.isRunning) return;

      const tweet = mockDataGenerator.generateTweet();
      this.processTweet(tweet);
    }, intervalMs);

    // Process queue regularly
    setInterval(() => {
      backpressureController.processQueue();
    }, 100); // Process every 100ms

    // Send metrics every 5 seconds
    this.metricsInterval = setInterval(() => {
      this.sendMetrics();
    }, 5000);

    // Cleanup stale connections every minute
    setInterval(() => {
      backpressureController.cleanupStaleConnections();
    }, 60000);

    logger.info(`✅ Stream started: ${CONFIG.streaming.tweetsPerSecond} tweets/sec`);
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    logger.info('🛑 Stream stopped');
  }

  private async processTweet(tweet: Tweet): Promise<void> {
    this.tweetCount++;

    // Store tweet in Redis with 1 hour TTL
    await redis.set(`tweet:${tweet.id}`, tweet, 3600);
    
    // Increment topic counter
    for (const hashtag of tweet.entities.hashtags) {
      await redis.increment(`hashtag:${hashtag}`);
    }

    // Create stream event
    const event: StreamEvent = {
      type: 'tweet',
      data: tweet,
      timestamp: new Date().toISOString(),
    };

    backpressureController.enqueueEvent(event);

    // Simple buzzer detection (will be replaced by AI service)
    const isSuspicious = this.quickBuzzerCheck(tweet);
    
    if (isSuspicious) {
      const buzzerEvent: StreamEvent = {
        type: 'buzzer_alert',
        data: {
          tweet_id: tweet.id,
          buzzer_score: 0.75,
          is_buzzer: true,
          reasons: [
            'High posting frequency detected',
            'Suspicious hashtag usage pattern',
          ],
          cluster_id: null,
          confidence: 0.75,
          analyzed_at: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      backpressureController.enqueueEvent(buzzerEvent);
    }
  }

  private quickBuzzerCheck(tweet: Tweet): boolean {
    // Quick heuristic checks
    const hasMultipleHashtags = tweet.entities.hashtags.length >= 3;
    const isNewAccount = new Date(tweet.author.created_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const hasHighFollowing = tweet.author.following > tweet.author.followers * 2;
    
    return hasMultipleHashtags && isNewAccount && hasHighFollowing;
  }

  private sendMetrics(): void {
    const runtime = (Date.now() - this.startTime) / 1000;
    const bpMetrics = backpressureController.getMetrics();

    const metrics: SystemMetrics = {
      tweets_per_second: parseFloat((this.tweetCount / runtime).toFixed(2)),
      buzzer_detection_rate: 0.3, // Mock value
      active_clients: bpMetrics.active_clients,
      queue_size: bpMetrics.queue_size,
      avg_latency_ms: 45, // Mock value
    };

    const event: StreamEvent = {
      type: 'metrics',
      data: metrics,
      timestamp: new Date().toISOString(),
    };

    backpressureController.enqueueEvent(event);
  }

  getStatus() {
    const runtime = (Date.now() - this.startTime) / 1000;
    
    return {
      is_running: this.isRunning,
      total_tweets: this.tweetCount,
      runtime_seconds: Math.floor(runtime),
      tweets_per_second: (this.tweetCount / runtime).toFixed(2),
      ...backpressureController.getMetrics(),
    };
  }
}

export const streamService = new StreamService();