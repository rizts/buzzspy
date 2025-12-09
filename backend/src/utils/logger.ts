import pino from 'pino';
import { CONFIG } from '../config/index.js';

export const logger = pino({
  level: CONFIG.server.env === 'production' ? 'info' : 'debug',
  transport: CONFIG.server.env === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export default logger;