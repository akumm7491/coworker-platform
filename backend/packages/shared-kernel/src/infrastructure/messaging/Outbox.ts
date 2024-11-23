import { Result } from '../../common/Result';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { Message, MessageBus } from './MessageBus';

export interface OutboxMessage {
  id: string;
  event: DomainEvent;
  status: OutboxMessageStatus;
  retryCount: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}

export enum OutboxMessageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IOutboxStore {
  save(message: OutboxMessage): Promise<void>;
  markAsProcessing(id: string): Promise<void>;
  markAsCompleted(id: string): Promise<void>;
  markAsFailed(id: string, error: string): Promise<void>;
  updateRetryCount(id: string, retryCount: number, lastAttempt: Date): Promise<void>;
  getPendingMessages(batchSize: number): Promise<OutboxMessage[]>;
  getFailedMessages(batchSize: number): Promise<OutboxMessage[]>;
}

export interface OutboxProcessorOptions {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
}

export class OutboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutboxError';
  }
}

export class OutboxProcessor {
  constructor(
    private readonly store: IOutboxStore,
    private readonly messageBus: MessageBus,
    private readonly options: OutboxProcessorOptions
  ) {}

  private convertToMessage(event: DomainEvent): Message {
    return {
      id: event.aggregateId,
      type: event.eventType,
      payload: event.toJSON(),
    };
  }

  async processMessages(): Promise<Result<void>> {
    try {
      const messages = await this.store.getPendingMessages(this.options.batchSize);

      for (const message of messages) {
        await this.processMessage(message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private async processMessage(message: OutboxMessage): Promise<void> {
    try {
      await this.store.markAsProcessing(message.id);
      await this.messageBus.publish(this.convertToMessage(message.event));
      await this.store.markAsCompleted(message.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (message.retryCount < this.options.maxRetries) {
        await this.store.updateRetryCount(message.id, message.retryCount + 1, new Date());
      } else {
        await this.store.markAsFailed(message.id, errorMessage);
      }
    }
  }

  async retryFailedMessages(): Promise<Result<void>> {
    try {
      const failedMessages = await this.store.getFailedMessages(this.options.batchSize);

      for (const message of failedMessages) {
        if (message.status === OutboxMessageStatus.FAILED) {
          message.status = OutboxMessageStatus.PENDING;
          message.error = undefined;
          await this.store.save(message);
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}

export class InMemoryOutboxStore implements IOutboxStore {
  private messages: Map<string, OutboxMessage> = new Map();

  async save(message: OutboxMessage): Promise<void> {
    this.messages.set(message.id, { ...message });
  }

  async markAsProcessing(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (!message) {
      throw new OutboxError(`Message ${id} not found`);
    }

    message.status = OutboxMessageStatus.PROCESSING;
  }

  async markAsCompleted(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (!message) {
      throw new OutboxError(`Message ${id} not found`);
    }

    message.status = OutboxMessageStatus.COMPLETED;
    message.error = undefined;
  }

  async markAsFailed(id: string, error: string): Promise<void> {
    const message = this.messages.get(id);
    if (!message) {
      throw new OutboxError(`Message ${id} not found`);
    }

    message.status = OutboxMessageStatus.FAILED;
    message.error = error;
  }

  async updateRetryCount(id: string, retryCount: number, lastAttempt: Date): Promise<void> {
    const message = this.messages.get(id);
    if (!message) {
      throw new OutboxError(`Message ${id} not found`);
    }

    message.retryCount = retryCount;
    message.lastAttempt = lastAttempt;
  }

  async getPendingMessages(batchSize: number): Promise<OutboxMessage[]> {
    const pendingMessages = Array.from(this.messages.values())
      .filter(m => m.status === OutboxMessageStatus.PENDING)
      .slice(0, batchSize);

    return pendingMessages;
  }

  async getFailedMessages(batchSize: number): Promise<OutboxMessage[]> {
    const failedMessages = Array.from(this.messages.values())
      .filter(m => m.status === OutboxMessageStatus.FAILED)
      .slice(0, batchSize);

    return failedMessages;
  }
}

export class Outbox {
  constructor(private readonly messageBus: MessageBus) {}

  private convertToMessage(event: DomainEvent): Message {
    return {
      id: event.aggregateId,
      type: event.eventType,
      payload: event.toJSON(),
    };
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.messageBus.publish(this.convertToMessage(event));
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
