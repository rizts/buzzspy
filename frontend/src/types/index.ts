export interface Tweet {
  id: string;
  text: string;
  author: Author;
  created_at: string;
  metrics: Metrics;
  entities: Entities;
}

export interface Author {
  id: string;
  username: string;
  display_name: string;
  followers: number;
  following: number;
  verified: boolean;
  created_at: string;
}

export interface Metrics {
  likes: number;
  retweets: number;
  replies: number;
  views: number;
}

export interface Entities {
  hashtags: string[];
  mentions: string[];
  urls: string[];
}

export interface BuzzerDetection {
  tweet_id: string;
  buzzer_score: number;
  is_buzzer: boolean;
  reasons: string[];
  cluster_id: string | null;
  confidence: number;
  analyzed_at: string;
}

export interface TrendingTopic {
  topic: string;
  tweet_count: number;
  buzzer_percentage: number;
  top_hashtags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  suspicious_score?: number;
}

export interface SystemMetrics {
  tweets_per_second: number;
  buzzer_detection_rate: number;
  active_clients: number;
  queue_size: number;
  avg_latency_ms: number;
}

export type StreamEventType = 'tweet' | 'buzzer_alert' | 'trending' | 'metrics' | 'connected';

export interface StreamEvent {
  type: StreamEventType;
  data: Tweet | BuzzerDetection | TrendingTopic | SystemMetrics | any;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  clientId: string | null;
  reconnectAttempts: number;
}