import { EventEmitter } from 'events';
import { Event, EventType } from './types.js';
import logger from '../utils/logger.js';


class EventBus {
  private static instance: EventBus;
  private eventEmitter: EventEmitter;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100); // Adjust based on needs
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public async publish<T>(event: Event<T>): Promise<void> {
    try {
      logger.info('Publishing event:', {
        type: event.type,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
      });

      this.eventEmitter.emit(event.type, event);

      // Here we could also:
      // 1. Store event in event store (PostgreSQL)
      // 2. Send to message queue (RabbitMQ/Kafka)
      // 3. Update read models (MongoDB)

      logger.info('Event published successfully');
    } catch (error) {
      logger.error('Error publishing event:', error);
      throw error;
    }
  }

  public subscribe<T>(eventType: EventType, handler: (event: Event<T>) => Promise<void>): void {
    this.eventEmitter.on(eventType, async (event: Event<T>) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error('Error handling event:', {
          type: eventType,
          error,
        });
      }
    });
  }

  public unsubscribe<T>(eventType: EventType, handler: (event: Event<T>) => Promise<void>): void {
    this.eventEmitter.off(eventType, handler);
  }
}

export const eventBus = EventBus.getInstance();
