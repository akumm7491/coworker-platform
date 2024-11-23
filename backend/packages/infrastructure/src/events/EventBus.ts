import { Injectable } from '@nestjs/common';
import { EventBus as CqrsEventBus, IEvent } from '@nestjs/cqrs';
import { AppLogger } from '../logging/Logger';

@Injectable()
export class EventBus extends CqrsEventBus {
  constructor(private readonly logger: AppLogger) {
    super();
    this.logger.setContext('EventBus');
  }

  async publish<T extends IEvent>(event: T): Promise<void> {
    this.logger.debug(`Publishing event: ${event.constructor.name}`);
    try {
      await super.publish(event);
      this.logger.debug(`Successfully published event: ${event.constructor.name}`);
    } catch (error) {
      this.logger.error(
        `Error publishing event: ${event.constructor.name}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }
}

@Injectable()
export class EventHandler<T extends IEvent> {
  constructor(protected readonly logger: AppLogger) {}

  protected async handle(event: T): Promise<void> {
    this.logger.debug(`Handling event: ${event.constructor.name}`);
    try {
      await this.handleEvent(event);
      this.logger.debug(`Successfully handled event: ${event.constructor.name}`);
    } catch (error) {
      this.logger.error(
        `Error handling event: ${event.constructor.name}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  protected async handleEvent(_event: T): Promise<void> {
    throw new Error('handleEvent method must be implemented');
  }
}
