import { Result } from '../../common/Result';
import { BaseError } from '../../common/errors/BaseError';
import { Logger } from '../../observability/Logger';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  details: Record<string, unknown>;
  timestamp: Date;
}

export interface IHealthCheck {
  name: string;
  check(): Promise<Result<HealthStatus, BaseError>>;
}

export class HealthCheckRegistry {
  private static instance: HealthCheckRegistry;
  private checks: Map<string, IHealthCheck> = new Map();
  private logger = Logger.getInstance();

  /** Private constructor for singleton pattern */
  private constructor() {
    // Private constructor ensures singleton pattern
  }

  public static getInstance(): HealthCheckRegistry {
    if (!HealthCheckRegistry.instance) {
      HealthCheckRegistry.instance = new HealthCheckRegistry();
    }
    return HealthCheckRegistry.instance;
  }

  public register(check: IHealthCheck): void {
    this.checks.set(check.name, check);
    this.logger.info(`Registered health check: ${check.name}`);
  }

  public unregister(name: string): void {
    this.checks.delete(name);
    this.logger.info(`Unregistered health check: ${name}`);
  }

  public async checkHealth(): Promise<Record<string, Result<HealthStatus, BaseError>>> {
    const results: Record<string, Result<HealthStatus, BaseError>> = {};

    for (const [name, check] of this.checks) {
      try {
        results[name] = await check.check();
      } catch (error) {
        this.logger.error(`Health check failed: ${name}`, error as Error);
        results[name] = Result.fail(error as BaseError);
      }
    }

    return results;
  }
}
