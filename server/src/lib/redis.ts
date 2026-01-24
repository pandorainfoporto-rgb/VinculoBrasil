// ============================================
// REDIS CLIENT
// ============================================

import Redis from 'ioredis';
import { config } from '../config/index.js';
import { logger } from './logger.js';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (error) => {
  logger.error(`Redis error: ${error instanceof Error ? error.message : String(error)}`);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});
