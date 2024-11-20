import { Logger } from 'winston';
import { Event } from '../events/types.js';
import { EventStore } from '../events/types.js';
import { EventProcessor as IEventProcessor } from './types.js';

export class EventProcessor implements IEventProcessor {
  private isProcessing = false;
  private lastProcessedPosition = 0;

  constructor(
    private readonly eventStore: EventStore,
    private readonly logger: Logger,
    private readonly processors: Map<string, (event: Event) => Promise<void>>,
  ) {}

  async processEvent(event: Event): Promise<void> {
    const processor = this.processors.get(event.type);
    if (!processor) {
      this.logger.warn('No processor found for event type', { eventType: event.type });
      return;
    }

    try {
      await processor(event);
      this.logger.info('Event processed successfully', {
        eventType: event.type,
        eventId: event.id,
      });
    } catch (error) {
      this.logger.error('Error processing event', {
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async startProcessing(pollInterval = 1000): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.logger.info('Starting event processing');

    while (this.isProcessing) {
      try {
        const events = await this.eventStore.getAllEvents(this.lastProcessedPosition);

        if (events.length === 0) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }

        for (const event of events) {
          await this.processEvent(event);
          this.lastProcessedPosition = event.position!;
        }
      } catch (error) {
        this.logger.error('Error in event processing loop', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
  }

  stopProcessing(): void {
    this.isProcessing = false;
    this.logger.info('Stopping event processing');
  }

  async getLastProcessedPosition(): Promise<number> {
    return this.lastProcessedPosition;
  }

  async setLastProcessedPosition(position: number): Promise<void> {
    this.lastProcessedPosition = position;
  }
}
