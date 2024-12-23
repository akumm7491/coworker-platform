import { Service } from 'typedi';
import Redis from 'ioredis';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';
import { MetricsService } from '../metrics/MetricsService.js';
import { metricsService } from '../metrics/MetricsService.js';

@Service()
export class CacheService {
  private static instance: CacheService;
  private readonly logger: Logger = logger;
  private readonly metrics: MetricsService;
  private readonly client: Redis;

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    };

    this.client = new Redis(redisConfig);
    this.metrics = metricsService;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) {
        this.metrics.incrementCounter('cache.misses', { key });
        return null;
      }

      this.metrics.incrementCounter('cache.hits', { key });
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error('Error getting cached data', { error, key });
      this.metrics.incrementCounter('cache.errors', {
        error_type: error.name,
      });
      throw error;
    }
  }

  public async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, data);
      } else {
        await this.client.set(key, data);
      }
      this.metrics.incrementCounter('cache.sets', { key });
      return true;
    } catch (error) {
      this.logger.error('Error setting cached data', { error, key });
      this.metrics.incrementCounter('cache.errors', {
        error_type: error.name,
      });
      throw error;
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      this.metrics.incrementCounter('cache.deletes', { key });
      return true;
    } catch (error) {
      this.logger.error('Error deleting cached data', { error, key });
      this.metrics.incrementCounter('cache.errors', {
        error_type: error.name,
      });
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error('Error checking cache key existence', { error, key });
      this.metrics.incrementCounter('cache.errors', {
        error_type: error.name,
      });
      throw error;
    }
  }

  public async clear(): Promise<void> {
    try {
      await this.client.flushdb();
      this.metrics.incrementCounter('cache.clears');
    } catch (error) {
      this.logger.error('Error clearing cache', { error });
      this.metrics.incrementCounter('cache.errors', {
        error_type: error.name,
      });
      throw error;
    }
  }

  public async getKeys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error('Error getting cache keys', { error, pattern });
      this.metrics.incrementCounter('cache.errors', {
        error_type: error.name,
      });
      throw error;
    }
  }

  public async createClient(): Promise<Redis> {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    };

    return new Redis(redisConfig);
  }

  public async close(): Promise<void> {
    await this.client.quit();
  }
}

export const cacheService = CacheService.getInstance();
