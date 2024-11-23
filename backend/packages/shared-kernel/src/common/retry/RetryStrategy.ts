import { Result } from '../Result';
import { BaseError, ErrorCategory, ErrorSeverity } from '../errors/BaseError';

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  timeout?: number;
}

export interface RetryContext {
  attempt: number;
  startTime: number;
  lastError?: Error;
}

export type RetryDecision = {
  shouldRetry: boolean;
  delay: number;
};

export class RetryStrategy {
  constructor(private readonly options: RetryOptions) {}

  public async execute<T>(
    operation: () => Promise<Result<T>>,
    errorFilter?: (error: Error) => boolean
  ): Promise<Result<T>> {
    const context: RetryContext = {
      attempt: 0,
      startTime: Date.now(),
    };

    do {
      try {
        const result = await operation();
        if (result.isOk()) {
          return result;
        }

        const error = result.getError();
        context.lastError = error;

        const decision = this.shouldRetry(error, context, errorFilter);
        if (!decision.shouldRetry) {
          return result;
        }

        await this.delay(decision.delay);
        context.attempt++;
      } catch (error) {
        context.lastError = error instanceof Error ? error : new Error(String(error));

        const decision = this.shouldRetry(context.lastError, context, errorFilter);
        if (!decision.shouldRetry) {
          return Result.fail(context.lastError);
        }

        await this.delay(decision.delay);
        context.attempt++;
      }
    } while (context.attempt < this.options.maxAttempts);

    // If we've exhausted all retries, return the last error
    return Result.fail(context.lastError || new Error('Max retry attempts reached'));
  }

  private shouldRetry(
    error: Error,
    context: RetryContext,
    errorFilter?: (error: Error) => boolean
  ): RetryDecision {
    // Check if we've exceeded max attempts
    if (context.attempt >= this.options.maxAttempts) {
      return { shouldRetry: false, delay: 0 };
    }

    // Check if we've exceeded timeout
    if (this.options.timeout && Date.now() - context.startTime >= this.options.timeout) {
      return { shouldRetry: false, delay: 0 };
    }

    // Check if error is retryable
    if (error instanceof BaseError) {
      if (!error.isRetryable()) {
        return { shouldRetry: false, delay: 0 };
      }

      // Don't retry critical errors
      if (error.getSeverity() === ErrorSeverity.CRITICAL) {
        return { shouldRetry: false, delay: 0 };
      }

      // Always retry infrastructure errors unless explicitly marked as non-retryable
      if (error.getCategory() === ErrorCategory.INFRASTRUCTURE && error.isRetryable()) {
        return {
          shouldRetry: true,
          delay: this.calculateDelay(context.attempt),
        };
      }
    }

    // Use custom error filter if provided
    if (errorFilter && !errorFilter(error)) {
      return { shouldRetry: false, delay: 0 };
    }

    return {
      shouldRetry: true,
      delay: this.calculateDelay(context.attempt),
    };
  }

  private calculateDelay(attempt: number): number {
    const delay = Math.min(
      this.options.initialDelay * Math.pow(this.options.backoffFactor, attempt),
      this.options.maxDelay
    );

    // Add jitter to prevent thundering herd
    return delay * (0.5 + Math.random());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Predefined retry strategies
export const DefaultRetryStrategy = new RetryStrategy({
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 1000,
  backoffFactor: 2,
});

export const AggressiveRetryStrategy = new RetryStrategy({
  maxAttempts: 5,
  initialDelay: 50,
  maxDelay: 500,
  backoffFactor: 1.5,
});

export const ConservativeRetryStrategy = new RetryStrategy({
  maxAttempts: 2,
  initialDelay: 200,
  maxDelay: 2000,
  backoffFactor: 3,
});
