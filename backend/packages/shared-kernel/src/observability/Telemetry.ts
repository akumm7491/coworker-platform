import { randomUUID } from 'crypto';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export interface TelemetrySpan {
  readonly context: TraceContext;
  readonly startTime: number;
  readonly name: string;

  addAttribute(key: string, value: string | number | boolean): void;
  addEvent(name: string, attributes?: Record<string, any>): void;
  end(endTime?: number): void;
}

export interface ITelemetryTracer {
  startSpan(name: string, options?: { parent?: TraceContext }): TelemetrySpan;
  getCurrentSpan(): TelemetrySpan | undefined;
  withSpan<T>(
    name: string,
    fn: (span: TelemetrySpan) => Promise<T>,
    options?: { parent?: TraceContext }
  ): Promise<T>;
}

export class TelemetrySpanImpl implements TelemetrySpan {
  private attributes: Map<string, string | number | boolean> = new Map();
  private events: Array<{ name: string; timestamp: number; attributes?: Record<string, any> }> = [];
  private endTime?: number;

  constructor(
    public readonly context: TraceContext,
    public readonly startTime: number,
    public readonly name: string
  ) {}

  addAttribute(key: string, value: string | number | boolean): void {
    if (this.endTime) {
      throw new Error('Cannot add attribute to ended span');
    }
    this.attributes.set(key, value);
  }

  addEvent(name: string, attributes?: Record<string, any>): void {
    if (this.endTime) {
      throw new Error('Cannot add event to ended span');
    }
    this.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
  }

  end(endTime: number = Date.now()): void {
    if (this.endTime) {
      throw new Error('Span already ended');
    }
    this.endTime = endTime;
  }

  toJSON(): Record<string, any> {
    return {
      traceId: this.context.traceId,
      spanId: this.context.spanId,
      parentSpanId: this.context.parentSpanId,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      attributes: Object.fromEntries(this.attributes),
      events: this.events,
    };
  }
}

export class TelemetryTracer implements ITelemetryTracer {
  private currentSpan?: TelemetrySpan;

  startSpan(name: string, options?: { parent?: TraceContext }): TelemetrySpan {
    const context: TraceContext = {
      traceId: options?.parent?.traceId ?? randomUUID(),
      spanId: randomUUID(),
      parentSpanId: options?.parent?.spanId,
    };

    const span = new TelemetrySpanImpl(context, Date.now(), name);
    this.currentSpan = span;
    return span;
  }

  getCurrentSpan(): TelemetrySpan | undefined {
    return this.currentSpan;
  }

  async withSpan<T>(
    name: string,
    fn: (span: TelemetrySpan) => Promise<T>,
    options?: { parent?: TraceContext }
  ): Promise<T> {
    const span = this.startSpan(name, options);
    try {
      const result = await fn(span);
      return result;
    } catch (error) {
      span.addAttribute('error', true);
      span.addAttribute('error.message', error.message);
      throw error;
    } finally {
      span.end();
    }
  }
}
