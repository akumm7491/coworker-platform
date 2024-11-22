import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { cacheService } from '../cache/CacheService.js';
import logger from '../../../utils/logger.js';

export interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  kind: 'SERVER' | 'CLIENT' | 'PRODUCER' | 'CONSUMER' | 'INTERNAL';
  startTime: number;
  endTime?: number;
  attributes: Record<string, any>;
  events: Array<{
    name: string;
    timestamp: number;
    attributes?: Record<string, any>;
  }>;
  status: {
    code: 'OK' | 'ERROR' | 'UNSET';
    message?: string;
  };
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentId?: string;
  serviceName: string;
  attributes: Record<string, any>;
}

export class TracingService {
  private static instance: TracingService;
  private storage: AsyncLocalStorage<TraceContext>;
  private redisClient: Redis;
  private readonly keyPrefix = 'trace:';
  private readonly retentionPeriod = 24 * 60 * 60; // 24 hours in seconds

  private constructor() {
    this.storage = new AsyncLocalStorage<TraceContext>();
    this.initialize();
  }

  static getInstance(): TracingService {
    if (!TracingService.instance) {
      TracingService.instance = new TracingService();
    }
    return TracingService.instance;
  }

  private async initialize(): Promise<void> {
    this.redisClient = await cacheService.createClient('tracing');
  }

  async startSpan(
    name: string,
    options: {
      kind?: Span['kind'];
      attributes?: Record<string, any>;
    } = {},
  ): Promise<Span> {
    const context = this.getContext();
    const span: Span = {
      id: uuidv4(),
      traceId: context?.traceId || uuidv4(),
      parentId: context?.spanId,
      name,
      kind: options.kind || 'INTERNAL',
      startTime: Date.now(),
      attributes: {
        ...options.attributes,
        serviceName: context?.serviceName,
      },
      events: [],
      status: { code: 'UNSET' },
    };

    await this.storeSpan(span);
    return span;
  }

  async endSpan(span: Span, error?: Error): Promise<void> {
    span.endTime = Date.now();
    span.status = error ? { code: 'ERROR', message: error.message } : { code: 'OK' };

    await this.storeSpan(span);
  }

  async addEvent(span: Span, name: string, attributes?: Record<string, any>): Promise<void> {
    span.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });

    await this.storeSpan(span);
  }

  async setSpanAttribute(span: Span, key: string, value: any): Promise<void> {
    span.attributes[key] = value;
    await this.storeSpan(span);
  }

  getContext(): TraceContext | undefined {
    return this.storage.getStore();
  }

  async withContext<T>(context: TraceContext, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(context, fn);
  }

  async getTrace(traceId: string): Promise<Span[]> {
    const keys = await this.redisClient.keys(`${this.keyPrefix}${traceId}:*`);
    const spans: Span[] = [];

    for (const key of keys) {
      const data = await this.redisClient.get(key);
      if (data) {
        spans.push(JSON.parse(data));
      }
    }

    return spans.sort((a, b) => a.startTime - b.startTime);
  }

  async findTraces(
    query: {
      serviceName?: string;
      startTime?: number;
      endTime?: number;
      attributes?: Record<string, any>;
      limit?: number;
    } = {},
  ): Promise<Span[][]> {
    const traces: Map<string, Span[]> = new Map();
    const pattern = `${this.keyPrefix}*`;
    const keys = await this.redisClient.keys(pattern);

    for (const key of keys) {
      const data = await this.redisClient.get(key);
      if (data) {
        const span = JSON.parse(data) as Span;
        if (this.matchesQuery(span, query)) {
          if (!traces.has(span.traceId)) {
            traces.set(span.traceId, []);
          }
          traces.get(span.traceId)!.push(span);
        }
      }
    }

    return Array.from(traces.values())
      .map(spans => spans.sort((a, b) => a.startTime - b.startTime))
      .sort((a, b) => b[0].startTime - a[0].startTime)
      .slice(0, query.limit || 10);
  }

  private async storeSpan(span: Span): Promise<void> {
    const key = `${this.keyPrefix}${span.traceId}:${span.id}`;
    await this.redisClient.setex(key, this.retentionPeriod, JSON.stringify(span));
  }

  private matchesQuery(
    span: Span,
    query: {
      serviceName?: string;
      startTime?: number;
      endTime?: number;
      attributes?: Record<string, any>;
    },
  ): boolean {
    return (
      (!query.serviceName || span.attributes.serviceName === query.serviceName) &&
      (!query.startTime || span.startTime >= query.startTime) &&
      (!query.endTime || span.startTime <= query.endTime) &&
      (!query.attributes ||
        Object.entries(query.attributes).every(([key, value]) => span.attributes[key] === value))
    );
  }
}

export const tracingService = TracingService.getInstance();
