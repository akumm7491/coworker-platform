import { createHash } from 'crypto';
import { BaseError, ErrorCategory, ErrorSeverity } from '../common/errors/BaseError';

export class Telemetry {
  private static instance: Telemetry;
  private readonly traces: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): Telemetry {
    if (!Telemetry.instance) {
      Telemetry.instance = new Telemetry();
    }
    return Telemetry.instance;
  }

  startTrace(operationName: string): string {
    try {
      const traceId = createHash('sha256')
        .update(`${operationName}-${Date.now()}`)
        .digest('hex');
      this.traces.set(traceId, Date.now());
      return traceId;
    } catch (error) {
      throw new BaseError(
        `Failed to start trace: ${error}`,
        ErrorCategory.Infrastructure,
        ErrorSeverity.Low
      );
    }
  }

  endTrace(traceId: string): number {
    const startTime = this.traces.get(traceId);
    if (!startTime) {
      throw new BaseError(
        `Trace ID not found: ${traceId}`,
        ErrorCategory.Infrastructure,
        ErrorSeverity.Low
      );
    }
    const duration = Date.now() - startTime;
    this.traces.delete(traceId);
    return duration;
  }
}
