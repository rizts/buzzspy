import { config } from 'dotenv';
config();

export const CONFIG = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  
  redis: {
    url: process.env.REDIS_URL || '',
    token: process.env.REDIS_TOKEN || '',
  },
  
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeout: 5000,
  },
  
  streaming: {
    maxClients: parseInt(process.env.MAX_CLIENTS || '100'),
    tweetsPerSecond: parseInt(process.env.TWEETS_PER_SECOND || '10'),
    backpressureThreshold: parseInt(process.env.BACKPRESSURE_THRESHOLD || '50'),
    keepAliveInterval: 30000, // 30 seconds
  },
  
  mock: {
    enabled: process.env.ENABLE_MOCK_DATA === 'true',
    buzzerRate: parseFloat(process.env.MOCK_BUZZER_RATE || '0.3'),
  },
};

export default CONFIG;