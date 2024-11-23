import { Result } from '../../common/Result';
import { IDomainEvent } from '../../domain/events/DomainEvent';
import { IMessageBus, PublishOptions } from './MessageBus';

export interface OutboxMessage<T extends IDomainEvent = IDomainEvent> {
  id: string;
  topic: string;
  message: T;
  status: OutboxMessageStatus;
  retryCount: number;
  lastAttempt?: Date;
  createdAt: Date;
  options?: PublishOptions;
  error?: string;
}

export enum OutboxMessageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}

export class OutboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutboxError';
  }
}

export interface IOutboxStore {
  save(message: OutboxMessage): Promise<Result<void>>;
  markAsProcessing(messageId: string): Promise<Result<void>>;
  markAsCompleted(messageId: string): Promise<Result<void>>;
  markAsFailed(messageId: string, error: Error): Promise<Result<void>>;
  getPendingMessages(batchSize: number): Promise<Result<OutboxMessage[]>>;
  getFailedMessages(batchSize: number): Promise<Result<OutboxMessage[]>>;
}

export interface OutboxProcessorOptions {
  batchSize: number;
  pollingInterval: number;
  maxRetries: number;
  retryDelay: number;
}

export class OutboxProcessor {
  constructor(
    private readonly store: IOutboxStore,
    private readonly messageBus: IMessageBus,
    private readonly options: OutboxProcessorOptions
  ) {}

  async processMessages(): Promise<Result<void>> {
    try {
      const pendingResult = await this.store.getPendingMessages(this.options.batchSize);
      if (!pendingResult.isOk()) {
        return Result.fail(pendingResult.getError());
      }

      const messages = pendingResult.getValue();
      for (const message of messages) {
        await this.processMessage(message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new OutboxError(String(error)));
    }
  }

  private async processMessage(message: OutboxMessage): Promise<void> {
    try {
      await this.store.markAsProcessing(message.id);

      const result = await this.messageBus.publish(message.topic, message.message, message.options);

      if (result.isOk()) {
        await this.store.markAsCompleted(message.id);
      } else {
        const error = result.getError();
        if (message.retryCount >= this.options.maxRetries) {
          await this.store.markAsFailed(message.id, error);
        } else {
          // Schedule for retry
          message.retryCount++;
          message.lastAttempt = new Date();
          message.status = OutboxMessageStatus.PENDING;
          await this.store.save(message);
        }
      }
    } catch (error) {
      await this.store.markAsFailed(
        message.id,
        error instanceof Error ? error : new OutboxError(String(error))
      );
    }
  }

  async start(): Promise<void> {
    setInterval(() => this.processMessages(), this.options.pollingInterval);
  }
}

// Example in-memory implementation of the outbox store
export class InMemoryOutboxStore implements IOutboxStore {
  private messages: Map<string, OutboxMessage> = new Map();

  async save(message: OutboxMessage): Promise<Result<void>> {
    this.messages.set(message.id, { ...message });
    return Result.ok(undefined);
  }

  async markAsProcessing(messageId: string): Promise<Result<void>> {
    const message = this.messages.get(messageId);
    if (!message) {
      return Result.fail(new OutboxError(`Message ${messageId} not found`));
    }

    message.status = OutboxMessageStatus.PROCESSING;
    return Result.ok(undefined);
  }

  async markAsCompleted(messageId: string): Promise<Result<void>> {
    const message = this.messages.get(messageId);
    if (!message) {
      return Result.fail(new OutboxError(`Message ${messageId} not found`));
    }

    message.status = OutboxMessageStatus.COMPLETED;
    message.error = undefined;
    return Result.ok(undefined);
  }

  async markAsFailed(messageId: string, error: Error): Promise<Result<void>> {
    const message = this.messages.get(messageId);
    if (!message) {
      return Result.fail(new OutboxError(`Message ${messageId} not found`));
    }

    message.status = OutboxMessageStatus.FAILED;
    message.error = error.message;
    return Result.ok(undefined);
  }

  async getPendingMessages(batchSize: number): Promise<Result<OutboxMessage[]>> {
    const pendingMessages = Array.from(this.messages.values())
      .filter(m => m.status === OutboxMessageStatus.PENDING)
      .slice(0, batchSize);

    return Result.ok(pendingMessages);
  }

  async getFailedMessages(batchSize: number): Promise<Result<OutboxMessage[]>> {
    const failedMessages = Array.from(this.messages.values())
      .filter(m => m.status === OutboxMessageStatus.FAILED)
      .slice(0, batchSize);

    return Result.ok(failedMessages);
  }
}
