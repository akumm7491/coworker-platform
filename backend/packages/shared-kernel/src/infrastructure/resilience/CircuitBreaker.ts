import { Result } from '../../common/Result';

export enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxAttempts: number;
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: Date;
  private halfOpenAttempts = 0;

  constructor(private readonly options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<Result<T>>): Promise<Result<T>> {
    if (this.isOpen()) {
      return Result.fail(new CircuitBreakerError('Circuit is open'));
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      return this.onFailure(error);
    }
  }

  private isOpen(): boolean {
    if (this.state === CircuitState.OPEN) {
      const now = new Date();
      if (
        this.lastFailureTime &&
        now.getTime() - this.lastFailureTime.getTime() > this.options.resetTimeout
      ) {
        this.state = CircuitState.HALF_OPEN;
        return false;
      }
      return true;
    }

    if (
      this.state === CircuitState.HALF_OPEN &&
      this.halfOpenAttempts >= this.options.halfOpenMaxAttempts
    ) {
      return true;
    }

    return false;
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
      this.halfOpenAttempts = 0;
    }
  }

  private onFailure(error: unknown): Result<never> {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;
    }

    if (this.state === CircuitState.CLOSED && this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
    }

    return Result.fail(error instanceof Error ? error : new CircuitBreakerError(String(error)));
  }

  getState(): CircuitState {
    return this.state;
  }
}
