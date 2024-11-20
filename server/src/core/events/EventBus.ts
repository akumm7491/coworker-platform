import { Event } from './types.js';
import { Logger } from 'winston';

type EventHandler = (event: Event) => Promise<void>;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>>;

  constructor(private readonly logger: Logger) {
    this.handlers = new Map();
  }

  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)?.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(eventType);
        }
      }
    };
  }

  async publish(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers) return;

    const promises = Array.from(handlers).map(async handler => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error('Error handling event', {
          eventType: event.type,
          eventId: event.id,
          error,
        });
      }
    });

    await Promise.all(promises);
  }

  async publishMany(events: Event[]): Promise<void> {
    await Promise.all(events.map(event => this.publish(event)));
  }

  clearHandlers(): void {
    this.handlers.clear();
  }
}
