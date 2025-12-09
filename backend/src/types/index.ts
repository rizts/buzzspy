// Tweet Interface
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

// AI Detection Result
export interface BuzzerDetection {
  tweet_id: string;
  buzzer_score: number;
  is_buzzer: boolean;
  reasons: string[];
  cluster_id: string | null;
  confidence: number;
  analyzed_at: string;
}

// Stream Event
export interface StreamEvent {
  type: 'tweet' | 'buzzer_alert' | 'trending' | 'metrics';
  data: Tweet | BuzzerDetection | TrendingTopic | SystemMetrics;
  timestamp: string;
}

export interface TrendingTopic {
  topic: string;
  tweet_count: number;
  buzzer_percentage: number;
  top_hashtags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface SystemMetrics {
  tweets_per_second: number;
  buzzer_detection_rate: number;
  active_clients: number;
  queue_size: number;
  avg_latency_ms: number;
}

// Client Connection
export interface ClientConnection {
  id: string;
  reply: any; // Fastify reply object
  connected_at: number;
  last_activity: number;
  events_sent: number;
}

// Backpressure Config
export interface BackpressureConfig {
  maxQueueSize: number;
  dropThreshold: number;
  priorityMode: 'fifo' | 'priority';
}