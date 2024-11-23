import { DomainEvent } from './DomainEvent';

/**
 * Interface for handling domain events
 */
export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

/**
 * Core event bus interface for publishing and subscribing to domain events
 */
export interface IEventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  publishAll<T extends DomainEvent>(events: T[]): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: IEventHandler<T>): void;
  unsubscribe<T extends DomainEvent>(eventType: string, handler: IEventHandler<T>): void;
}

/**
 * Interface for event serialization and deserialization
 */
export interface IEventSerializer {
  serialize<T extends DomainEvent>(event: T): string;
  deserialize<T extends DomainEvent>(eventData: string, eventType: string): T;
  registerEventType<T extends DomainEvent>(
    eventType: string,
    constructor: new (...args: any[]) => T
  ): void;
}

/**
 * Robust implementation of event serialization with proper type handling
 */
export class EventSerializer implements IEventSerializer {
  private eventConstructors: Map<string, new (...args: any[]) => DomainEvent> = new Map();

  registerEventType<T extends DomainEvent>(
    eventType: string,
    constructor: new (...args: any[]) => T
  ): void {
    this.eventConstructors.set(eventType, constructor);
  }

  serialize<T extends DomainEvent>(event: T): string {
    return JSON.stringify({
      type: event.eventType,
      version: event.version,
      occurredOn: event.occurredOn.toISOString(),
      aggregateId: event.aggregateId,
      data: this.serializeEventData(event),
    });
  }

  deserialize<T extends DomainEvent>(eventData: string, eventType: string): T {
    const parsed = JSON.parse(eventData);
    const constructor = this.eventConstructors.get(eventType);

    if (!constructor) {
      throw new Error(`No constructor registered for event type: ${eventType}`);
    }

    return new constructor({
      ...parsed.data,
      eventType: parsed.type,
      version: parsed.version,
      aggregateId: parsed.aggregateId,
      occurredOn: new Date(parsed.occurredOn),
    }) as T;
  }

  private serializeEventData<T extends DomainEvent>(event: T): Record<string, unknown> {
    const eventData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(event)) {
      if (!['eventType', 'version', 'occurredOn', 'aggregateId'].includes(key)) {
        eventData[key] = this.serializeValue(value);
      }
    }

    return eventData;
  }

  private serializeValue(value: unknown): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (Array.isArray(value)) {
      return value.map(item => this.serializeValue(item));
    }
    if (value instanceof Object && !(value instanceof Date)) {
      const serialized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        serialized[key] = this.serializeValue(val);
      }
      return serialized;
    }
    return value;
  }
}

/**
 * Base implementation of the event bus with error handling and logging
 */
export abstract class BaseEventBus implements IEventBus {
  private handlers: Map<string, Set<IEventHandler<any>>> = new Map();
  private readonly retryAttempts = 3;
  private readonly retryDelay = 1000; // ms

  constructor(
    protected readonly serializer: IEventSerializer,
    protected readonly logger: Console = console
  ) {}

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || new Set();

    if (handlers.size === 0) {
      this.logger.warn(`No handlers registered for event type: ${event.eventType}`);
      return;
    }

    const publishPromises = Array.from(handlers).map(handler =>
      this.executeWithRetry(() => handler.handle(event))
    );

    try {
      await Promise.all(publishPromises);
      await this.persistEvent(event);
    } catch (error) {
      this.logger.error(`Failed to publish event ${event.eventType}:`, error);
      throw error;
    }
  }

  async publishAll<T extends DomainEvent>(events: T[]): Promise<void> {
    try {
      await Promise.all(events.map(event => this.publish(event)));
    } catch (error) {
      this.logger.error('Failed to publish events batch:', error);
      throw error;
    }
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: IEventHandler<T>): void {
    const handlers = this.handlers.get(eventType) || new Set();
    handlers.add(handler);
    this.handlers.set(eventType, handlers);
    this.logger.debug(`Handler subscribed to event type: ${eventType}`);
  }

  unsubscribe<T extends DomainEvent>(eventType: string, handler: IEventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
      this.logger.debug(`Handler unsubscribed from event type: ${eventType}`);
    }
  }

  private async executeWithRetry(operation: () => Promise<void>, attempt = 1): Promise<void> {
    try {
      await operation();
    } catch (error) {
      if (attempt >= this.retryAttempts) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      return this.executeWithRetry(operation, attempt + 1);
    }
  }

  protected abstract persistEvent<T extends DomainEvent>(event: T): Promise<void>;
}
