import { Service } from 'typedi';
import Redis from 'ioredis';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';
import { Event } from './Event.js';

export type EventHandler<T> = (event: Event<T>) => Promise<void>;

@Service()
export class EventBus {
  private static instance: EventBus;
  private readonly logger: Logger = logger;
  private readonly subscribers: Map<string, Set<EventHandler<unknown>>> = new Map();
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    };

    this.publisher = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);

    this.subscriber.on('message', this.handleMessage.bind(this));
  }

  public async publish<T>(eventType: string, payload: T): Promise<void> {
    try {
      const event: Event<T> = {
        id: crypto.randomUUID(),
        type: eventType,
        timestamp: new Date(),
        source: process.env.SERVICE_NAME || 'unknown',
        payload,
      };

      await this.publisher.publish(eventType, JSON.stringify(event));
      this.logger.debug('Event published', { eventType, event });
    } catch (error) {
      this.logger.error('Error publishing event', { error, eventType, payload });
      throw error;
    }
  }

  public subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    try {
      let handlers = this.subscribers.get(eventType);
      if (!handlers) {
        handlers = new Set();
        this.subscribers.set(eventType, handlers);
        this.subscriber.subscribe(eventType);
      }
      handlers.add(handler as EventHandler<unknown>);
      this.logger.debug('Event handler subscribed', { eventType });
    } catch (error) {
      this.logger.error('Error subscribing to event', { error, eventType });
      throw error;
    }
  }

  public unsubscribe<T>(eventType: string, handler: EventHandler<T>): void {
    try {
      const handlers = this.subscribers.get(eventType);
      if (handlers) {
        handlers.delete(handler as EventHandler<unknown>);
        if (handlers.size === 0) {
          this.subscribers.delete(eventType);
          this.subscriber.unsubscribe(eventType);
        }
      }
      this.logger.debug('Event handler unsubscribed', { eventType });
    } catch (error) {
      this.logger.error('Error unsubscribing from event', { error, eventType });
      throw error;
    }
  }

  private async handleMessage(channel: string, message: string): Promise<void> {
    try {
      const event: Event = JSON.parse(message);
      const handlers = this.subscribers.get(channel);
      if (handlers) {
        await Promise.all(
          Array.from(handlers).map((handler) =>
            handler(event).catch((error) => {
              this.logger.error('Error in event handler', {
                error,
                channel,
                event,
              });
            }),
          ),
        );
      }
    } catch (error) {
      this.logger.error('Error handling event message', {
        error,
        channel,
        message,
      });
    }
  }
}
