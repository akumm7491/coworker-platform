import { Redis } from 'ioredis';
import { Result } from '../../common/Result';
import { BaseError, ErrorSeverity } from '../../common/errors/BaseError';
import { InfrastructureError } from '../../common/errors/InfrastructureError';
import { Logger } from '../../observability/Logger';

export class RedisCache {
  private static instance: RedisCache;
  private readonly redis: Redis;
  private readonly logger = Logger.getInstance();

  private constructor() {
    // TODO: Make these configurable through environment variables
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    });

    this.redis.on('error', (err: Error) => {
      this.logger.error('Redis connection error', err);
    });
  }

  public static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  public async get<T>(key: string): Promise<Result<T | null, BaseError>> {
    try {
      const value = await this.redis.get(key);
      if (!value) {
        return Result.ok(null);
      }
      return Result.ok(JSON.parse(value) as T);
    } catch (error) {
      return Result.fail(
        new InfrastructureError(
          `Failed to get value from Redis cache: ${error instanceof Error ? error.message : String(error)}`,
          'REDIS_GET_ERROR',
          ErrorSeverity.LOW,
          true,
          { cacheKey: key }
        )
      );
    }
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<Result<void, BaseError>> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new InfrastructureError(
          `Failed to set value in Redis cache: ${error instanceof Error ? error.message : String(error)}`,
          'REDIS_SET_ERROR',
          ErrorSeverity.LOW,
          true,
          { cacheKey: key, ttl }
        )
      );
    }
  }

  public async delete(key: string): Promise<Result<void, BaseError>> {
    try {
      await this.redis.del(key);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new InfrastructureError(
          `Failed to delete value from Redis cache: ${error instanceof Error ? error.message : String(error)}`,
          'REDIS_DELETE_ERROR',
          ErrorSeverity.LOW,
          true,
          { cacheKey: key }
        )
      );
    }
  }
}
