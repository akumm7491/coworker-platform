import { Service } from 'typedi';
import { EventEmitter } from 'events';
import { BaseEventType, BaseEventMetadata, BaseEventPayload } from './EventTypes.js';
import { logger } from '../../utils/logger.js';

@Service('event.bus')
export class EventBus {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100); // Adjust based on needs
  }

  async publish<T extends BaseEventPayload>(
    type: BaseEventType | string,
    payload: T,
    metadata: BaseEventMetadata,
  ): Promise<void> {
    try {
      const event = {
        type,
        payload,
        metadata: {
          ...metadata,
          timestamp: new Date(),
        },
      };

      this.eventEmitter.emit(type, event);
      logger.debug('Event published', { type, payload, metadata });
    } catch (error) {
      logger.error('Failed to publish event', { error, type, payload, metadata });
      throw error;
    }
  }

  subscribe<T extends BaseEventPayload>(
    type: BaseEventType | string,
    handler: (event: { type: string; payload: T; metadata: BaseEventMetadata }) => Promise<void>,
  ): void {
    this.eventEmitter.on(type, handler);
    logger.debug('Event handler subscribed', { type });
  }

  unsubscribe<T extends BaseEventPayload>(
    type: BaseEventType | string,
    handler: (event: { type: string; payload: T; metadata: BaseEventMetadata }) => Promise<void>,
  ): void {
    this.eventEmitter.off(type, handler);
    logger.debug('Event handler unsubscribed', { type });
  }
}
