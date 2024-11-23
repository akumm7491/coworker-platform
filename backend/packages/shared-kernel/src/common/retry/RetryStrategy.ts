import { BaseError, ErrorCategory } from '../errors/BaseError';

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export class RetryStrategy {
  private readonly config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxAttempts: config?.maxAttempts ?? 3,
      initialDelay: config?.initialDelay ?? 1000,
      maxDelay: config?.maxDelay ?? 10000,
      backoffFactor: config?.backoffFactor ?? 2,
    };
  }

  private calculateDelay(attempt: number): number {
    const delay = this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt);
    return Math.min(delay, this.config.maxDelay);
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof BaseError && !error.retryable) {
          throw error;
        }

        if (attempt < this.config.maxAttempts - 1) {
          const delay = this.calculateDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new BaseError(
      `Max retry attempts (${this.config.maxAttempts}) reached: ${lastError?.message}`,
      ErrorCategory.Infrastructure
    );
  }
}
