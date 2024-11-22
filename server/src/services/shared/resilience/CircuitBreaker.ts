import { EventEmitter } from 'events';
import logger from '../../../utils/logger.js';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitorInterval?: number;
  timeout?: number;
  volumeThreshold?: number;
  errorThresholdPercentage?: number;
}

export interface CircuitBreakerStats {
  failures: number;
  successes: number;
  rejected: number;
  lastFailure?: Error;
  lastReset: Date;
  state: CircuitBreakerState;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private rejectedCount = 0;
  private lastFailure?: Error;
  private lastReset: Date = new Date();
  private resetTimeout: NodeJS.Timeout | null = null;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    super();
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000,
      monitorInterval: options.monitorInterval || 10000,
      timeout: options.timeout || 10000,
      volumeThreshold: options.volumeThreshold || 10,
      errorThresholdPercentage: options.errorThresholdPercentage || 50,
    };

    this.startMonitoring();
  }

  async execute<T>(command: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      this.rejectedCount++;
      this.emit('rejected', { command, reason: 'Circuit breaker is OPEN' });

      if (fallback) {
        return fallback();
      }
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await this.executeWithTimeout(command);
      this.handleSuccess();
      return result;
    } catch (error) {
      this.handleFailure(error as Error);
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private async executeWithTimeout<T>(command: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Command timed out'));
      }, this.options.timeout);

      command()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private handleSuccess(): void {
    this.successCount++;
    if (this.state === 'HALF_OPEN') {
      this.reset();
    }
  }

  private handleFailure(error: Error): void {
    this.failureCount++;
    this.lastFailure = error;

    const totalAttempts = this.failureCount + this.successCount;

    if (
      totalAttempts >= this.options.volumeThreshold &&
      (this.failureCount / totalAttempts) * 100 >= this.options.errorThresholdPercentage
    ) {
      this.trip();
    }
  }

  private trip(): void {
    if (this.state === 'CLOSED') {
      this.state = 'OPEN';
      this.emit('open', { lastFailure: this.lastFailure });
      this.resetTimeout = setTimeout(() => {
        this.halfOpen();
      }, this.options.resetTimeout);
    }
  }

  private halfOpen(): void {
    this.state = 'HALF_OPEN';
    this.emit('half_open');
  }

  private reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.rejectedCount = 0;
    this.lastFailure = undefined;
    this.lastReset = new Date();
    this.state = 'CLOSED';

    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }

    this.emit('close');
  }

  private startMonitoring(): void {
    setInterval(() => {
      const stats = this.getStats();
      this.emit('stats', stats);
      logger.debug('Circuit breaker stats:', stats);
    }, this.options.monitorInterval);
  }

  getStats(): CircuitBreakerStats {
    return {
      failures: this.failureCount,
      successes: this.successCount,
      rejected: this.rejectedCount,
      lastFailure: this.lastFailure,
      lastReset: this.lastReset,
      state: this.state,
    };
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  forceOpen(): void {
    this.state = 'OPEN';
    this.emit('force_open');
  }

  forceClose(): void {
    this.reset();
    this.emit('force_close');
  }
}

export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();

  private constructor() {}

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  getBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(options));
    }
    return this.breakers.get(name)!;
  }

  removeBreaker(name: string): void {
    this.breakers.delete(name);
  }

  getAllBreakers(): Map<string, CircuitBreaker> {
    return this.breakers;
  }
}

export const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
