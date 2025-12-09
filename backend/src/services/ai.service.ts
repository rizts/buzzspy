import { CONFIG } from '../config/index.js';
import type { Tweet, BuzzerDetection } from '../types/index.js';

export async function callAIService(tweet: Tweet): Promise<BuzzerDetection> {
  try {
    const response = await fetch(`${CONFIG.ai.serviceUrl}/api/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweet }),
      signal: AbortSignal.timeout(CONFIG.ai.timeout),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('AI service call failed:', error);
    // Fallback to quick heuristic check
    return {
      tweet_id: tweet.id,
      buzzer_score: 0.5,
      is_buzzer: false,
      reasons: ['AI service unavailable'],
      confidence: 0.3,
      analyzed_at: new Date().toISOString(),
    };
  }
}