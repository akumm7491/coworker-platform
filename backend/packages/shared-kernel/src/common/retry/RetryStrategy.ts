import { Result } from '../Result';
import { BaseError, ErrorSeverity } from '../errors/BaseError';
import { InfrastructureError } from '../errors/InfrastructureError';

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
  lastError?: BaseError;
}

export type RetryDecision = {
  shouldRetry: boolean;
  delay: number;
};

export class RetryStrategy {
  constructor(private readonly options: RetryOptions) {}

  public async execute<T>(
    operation: () => Promise<Result<T, BaseError>>,
    errorFilter?: (error: BaseError) => boolean
  ): Promise<Result<T, BaseError>> {
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
        // Convert unexpected errors to InfrastructureError
        const baseError =
          error instanceof BaseError
            ? error
            : new InfrastructureError(
                error instanceof Error ? error.message : String(error),
                'UNEXPECTED_ERROR',
                ErrorSeverity.HIGH,
                true,
                { attempt: context.attempt }
              );

        context.lastError = baseError;
        const decision = this.shouldRetry(baseError, context, errorFilter);
        if (!decision.shouldRetry) {
          return Result.fail(baseError);
        }

        await this.delay(decision.delay);
        context.attempt++;
      }
    } while (this.canContinue(context));

    // If we've exhausted all retries, return the last error
    return Result.fail(
      context.lastError ??
        new InfrastructureError(
          'Maximum retry attempts exceeded',
          'MAX_RETRIES_EXCEEDED',
          ErrorSeverity.HIGH,
          false,
          {
            maxAttempts: this.options.maxAttempts,
            totalTime: Date.now() - context.startTime,
          }
        )
    );
  }

  private shouldRetry(
    error: BaseError,
    context: RetryContext,
    errorFilter?: (error: BaseError) => boolean
  ): RetryDecision {
    if (!this.canContinue(context)) {
      return { shouldRetry: false, delay: 0 };
    }

    if (errorFilter && !errorFilter(error)) {
      return { shouldRetry: false, delay: 0 };
    }

    // Don't retry if the error is explicitly marked as not retryable
    if (error instanceof BaseError && !error.retryable) {
      return { shouldRetry: false, delay: 0 };
    }

    const delay = this.calculateDelay(context.attempt);
    return { shouldRetry: true, delay };
  }

  private canContinue(context: RetryContext): boolean {
    if (context.attempt >= this.options.maxAttempts) {
      return false;
    }

    if (this.options.timeout && Date.now() - context.startTime >= this.options.timeout) {
      return false;
    }

    return true;
  }

  private calculateDelay(attempt: number): number {
    const delay = Math.min(
      this.options.initialDelay * Math.pow(this.options.backoffFactor, attempt),
      this.options.maxDelay
    );

    // Add jitter to prevent thundering herd
    return delay * (0.5 + Math.random() * 0.5);
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
