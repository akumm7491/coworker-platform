import { EventEmitter } from 'events';
import Redis from 'ioredis';

class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;
  private redis: Redis;

  private constructor() {
    this.emitter = new EventEmitter();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    // Subscribe to Redis channels
    this.redis.subscribe('agent-events', 'user-events', err => {
      if (err) {
        console.error('Redis subscription error:', err);
      }
    });

    // Handle incoming Redis messages
    this.redis.on('message', (channel, message) => {
      try {
        const event = JSON.parse(message);
        this.emitter.emit(event.type, event.payload);
      } catch (error) {
        console.error('Error processing Redis message:', error);
      }
    });
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public async publish(eventType: string, payload: any): Promise<void> {
    const event = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    await this.redis.publish('agent-events', JSON.stringify(event));
    this.emitter.emit(eventType, payload);
  }

  public subscribe(eventType: string, handler: (payload: any) => void): void {
    this.emitter.on(eventType, handler);
  }

  public unsubscribe(eventType: string, handler: (payload: any) => void): void {
    this.emitter.off(eventType, handler);
  }
}

export const eventBus = EventBus.getInstance();
