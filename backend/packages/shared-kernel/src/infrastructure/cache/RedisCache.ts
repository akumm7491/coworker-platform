import IORedis from 'ioredis';
import { BaseError, ErrorCategory, ErrorSeverity } from '../../common/errors/BaseError';

export class RedisCache {
  private readonly client: IORedis;

  constructor() {
    this.client = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      throw new BaseError(
        `Failed to get value from Redis: ${error}`,
        ErrorCategory.Infrastructure,
        ErrorSeverity.Medium,
        true
      );
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      throw new BaseError(
        `Failed to set value in Redis: ${error}`,
        ErrorCategory.Infrastructure,
        ErrorSeverity.Medium,
        true
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      throw new BaseError(
        `Failed to delete value from Redis: ${error}`,
        ErrorCategory.Infrastructure,
        ErrorSeverity.Medium,
        true
      );
    }
  }
}
