import { Result } from '../../common/Result';
import { BaseError } from '../../common/errors/BaseError';
import { Logger } from '../../observability/Logger';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private logger = Logger.getInstance();

  constructor(private config: RateLimitConfig) {}

  public async isAllowed(key: string): Promise<Result<boolean, BaseError>> {
    const now = Date.now();
    const fullKey = `${this.config.keyPrefix || ''}:${key}`;

    const record = this.store.get(fullKey);

    if (!record || now > record.resetTime) {
      this.store.set(fullKey, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return Result.ok(true);
    }

    if (record.count >= this.config.maxRequests) {
      this.logger.warn(`Rate limit exceeded for key: ${key}`);
      return Result.ok(false);
    }

    record.count += 1;
    return Result.ok(true);
  }

  public async reset(key: string): Promise<void> {
    const fullKey = `${this.config.keyPrefix || ''}:${key}`;
    this.store.delete(fullKey);
    this.logger.info(`Rate limit reset for key: ${key}`);
  }
}
