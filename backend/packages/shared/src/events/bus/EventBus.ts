import { DomainEvent } from '../definitions/DomainEvent';
import { EventHandler } from '../handlers/EventHandler';
import { Logger } from '../../utils/logger';
import { CircuitBreaker } from '../../utils/circuit-breaker';

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

export class EventBus implements IEventBus {
  private handlers: Map<string, Set<EventHandler>>;
  private readonly logger: Logger;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(logger: Logger) {
    this.handlers = new Map();
    this.logger = logger;
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000,
    });
  }

  public async publish(event: DomainEvent): Promise<void> {
    const eventType = event.eventType;
    const handlers = this.handlers.get(eventType);

    if (!handlers) {
      this.logger.warn(`No handlers registered for event type: ${eventType}`);
      return;
    }

    const publishPromises = Array.from(handlers).map(async (handler) => {
      try {
        await this.circuitBreaker.execute(() => handler.handle(event));
      } catch (error) {
        this.logger.error('Error handling event', {
          eventType,
          handlerName: handler.constructor.name,
          error,
        });
        throw error;
      }
    });

    await Promise.all(publishPromises);
  }

  public subscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) || new Set();
    handlers.add(handler);
    this.handlers.set(eventType, handlers);
  }

  public unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }
}
