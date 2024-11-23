import { Result } from '../../common/Result';

export interface LockOptions {
  ttl: number; // Time-to-live in milliseconds
  retryCount?: number;
  retryDelay?: number; // Delay between retries in milliseconds
}

export class LockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LockError';
  }
}

export interface IDistributedLock {
  acquire(resourceId: string, options: LockOptions): Promise<Result<void>>;
  release(resourceId: string): Promise<Result<void>>;
  extend(resourceId: string, ttl: number): Promise<Result<void>>;
}

export abstract class DistributedLock implements IDistributedLock {
  abstract acquire(resourceId: string, options: LockOptions): Promise<Result<void>>;
  abstract release(resourceId: string): Promise<Result<void>>;
  abstract extend(resourceId: string, ttl: number): Promise<Result<void>>;

  protected async withLock<T>(
    resourceId: string,
    options: LockOptions,
    operation: () => Promise<Result<T>>
  ): Promise<Result<T>> {
    const acquireResult = await this.acquire(resourceId, options);
    if (!acquireResult.isOk()) {
      return Result.fail(acquireResult.getError());
    }

    try {
      const result = await operation();
      await this.release(resourceId);
      return result;
    } catch (error) {
      await this.release(resourceId);
      return Result.fail(error instanceof Error ? error : new LockError(String(error)));
    }
  }

  protected validateResourceId(resourceId: string): Result<void> {
    if (!resourceId) {
      return Result.fail(new LockError('Resource ID is required'));
    }
    return Result.ok(undefined);
  }

  protected validateTTL(ttl: number): Result<void> {
    if (ttl <= 0) {
      return Result.fail(new LockError('TTL must be greater than 0'));
    }
    return Result.ok(undefined);
  }
}

// Example Redis-based implementation (abstract as actual Redis client would be injected)
export abstract class RedisDistributedLock extends DistributedLock {
  protected abstract acquireLock(resourceId: string, ttl: number): Promise<Result<boolean>>;
  protected abstract releaseLock(resourceId: string): Promise<Result<boolean>>;
  protected abstract extendLock(resourceId: string, ttl: number): Promise<Result<boolean>>;

  async acquire(resourceId: string, options: LockOptions): Promise<Result<void>> {
    const validateResult = this.validateResourceId(resourceId);
    if (!validateResult.isOk()) {
      return validateResult;
    }

    const ttlValidation = this.validateTTL(options.ttl);
    if (!ttlValidation.isOk()) {
      return ttlValidation;
    }

    const retryCount = options.retryCount || 0;
    const retryDelay = options.retryDelay || 100;

    for (let i = 0; i <= retryCount; i++) {
      const result = await this.acquireLock(resourceId, options.ttl);
      if (result.isOk() && result.getValue()) {
        return Result.ok(undefined);
      }

      if (i < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    return Result.fail(new LockError(`Failed to acquire lock for resource ${resourceId}`));
  }

  async release(resourceId: string): Promise<Result<void>> {
    const validateResult = this.validateResourceId(resourceId);
    if (!validateResult.isOk()) {
      return validateResult;
    }

    const result = await this.releaseLock(resourceId);
    if (!result.isOk() || !result.getValue()) {
      return Result.fail(new LockError(`Failed to release lock for resource ${resourceId}`));
    }

    return Result.ok(undefined);
  }

  async extend(resourceId: string, ttl: number): Promise<Result<void>> {
    const validateResult = this.validateResourceId(resourceId);
    if (!validateResult.isOk()) {
      return validateResult;
    }

    const ttlValidation = this.validateTTL(ttl);
    if (!ttlValidation.isOk()) {
      return ttlValidation;
    }

    const result = await this.extendLock(resourceId, ttl);
    if (!result.isOk() || !result.getValue()) {
      return Result.fail(new LockError(`Failed to extend lock for resource ${resourceId}`));
    }

    return Result.ok(undefined);
  }
}
