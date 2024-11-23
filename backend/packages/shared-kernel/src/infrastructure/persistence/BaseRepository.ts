import { Result } from '../../common/Result';
import { BaseError } from '../../common/errors/BaseError';
import { RetryStrategy } from '../../common/retry/RetryStrategy';
import { IRepository, RepositoryOptions } from './IRepository';
import { Logger } from '../../observability/Logger';
import { RedisCache } from '../cache/RedisCache';

/**
 * Base repository implementation with infrastructure concerns
 * Handles retries, caching, and basic error handling
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  protected readonly logger = Logger.getInstance();
  protected readonly cache = RedisCache.getInstance();

  constructor(
    protected readonly options: RepositoryOptions = {},
    protected readonly retryStrategy?: RetryStrategy
  ) {}

  abstract findById(id: string): Promise<Result<T, BaseError>>;
  abstract findAll(): Promise<Result<T[], BaseError>>;
  abstract save(entity: T): Promise<Result<T, BaseError>>;
  abstract update(entity: T): Promise<Result<T, BaseError>>;
  abstract delete(id: string): Promise<Result<void, BaseError>>;

  /**
   * Execute an operation with retry logic
   * @param operation The operation to execute
   * @returns Result of the operation
   */
  protected async withRetry<R>(
    operation: () => Promise<Result<R, BaseError>>
  ): Promise<Result<R, BaseError>> {
    if (this.retryStrategy) {
      return this.retryStrategy.execute(operation);
    }
    return operation();
  }

  /**
   * Execute an operation with caching if enabled
   * @param key Cache key
   * @param operation The operation to execute
   * @param ttl Time to live in seconds
   * @returns Result of the operation
   */
  protected async withCache<R>(
    key: string,
    operation: () => Promise<Result<R, BaseError>>,
    ttl?: number
  ): Promise<Result<R, BaseError>> {
    // Try to get from cache first
    const cachedResult = await this.getCacheValue<R>(key);
    if (cachedResult.isOk()) {
      const value = cachedResult.getValue();
      if (value !== null) {
        this.logger.debug('Cache hit', { key });
        return Result.ok(value);
      }
    }

    // If not in cache or cache error, execute operation
    const result = await operation();
    if (result.isOk()) {
      // Try to cache the result
      const cacheResult = await this.setCacheValue(key, result.getValue(), ttl);
      if (cacheResult.isFail()) {
        this.logger.warn('Failed to cache value', { key, error: cacheResult.getError() });
      }
    }

    return result;
  }

  /**
   * Execute an operation with both retry and caching if enabled
   * @param key Cache key
   * @param operation The operation to execute
   * @param ttl Time to live in seconds
   * @returns Result of the operation
   */
  protected async withRetryAndCache<R>(
    key: string,
    operation: () => Promise<Result<R, BaseError>>,
    ttl?: number
  ): Promise<Result<R, BaseError>> {
    if (this.options.cacheable) {
      return this.withCache(key, () => this.withRetry(operation), ttl);
    }
    return this.withRetry(operation);
  }

  protected async getCacheValue<T>(key: string): Promise<Result<T | null, BaseError>> {
    return this.cache.get<T>(key);
  }

  protected async setCacheValue<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<Result<void, BaseError>> {
    return this.cache.set(key, value, ttl);
  }

  protected async invalidateCache(key: string): Promise<Result<void, BaseError>> {
    return this.cache.delete(key);
  }
}
