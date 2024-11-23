import { Result } from '../../common/Result';
import { IDomainEvent } from '../../domain/events/DomainEvent';
import { MessageBusError, ExternalServiceError } from '../../common/errors/InfrastructureError';
import { DefaultRetryStrategy, RetryStrategy } from '../../common/retry/RetryStrategy';

export interface PublishOptions {
  partitionKey?: string;
  headers?: Record<string, string>;
  retryStrategy?: RetryStrategy;
}

export interface SubscribeOptions {
  groupId: string;
  concurrency?: number;
  retryStrategy?: RetryStrategy;
  deadLetterQueue?: string;
}

export interface IMessageBus {
  publish<T extends IDomainEvent>(
    topic: string,
    message: T,
    options?: PublishOptions
  ): Promise<Result<void>>;
  subscribe<T extends IDomainEvent>(
    topic: string,
    handler: (message: T) => Promise<void>,
    options?: SubscribeOptions
  ): Promise<Result<void>>;
}

export abstract class MessageBus implements IMessageBus {
  async publish<T extends IDomainEvent>(
    topic: string,
    message: T,
    options?: PublishOptions
  ): Promise<Result<void>> {
    const retryStrategy = options?.retryStrategy || DefaultRetryStrategy;

    return retryStrategy.execute(async () => {
      try {
        const validationResult = this.validateMessage(message);
        if (!validationResult.isOk()) {
          return validationResult;
        }

        const result = await this.doPublish(topic, message, options);
        if (!result.isOk()) {
          return Result.fail(
            new MessageBusError(
              `Failed to publish message to ${topic}: ${result.getError().message}`
            )
          );
        }

        return Result.ok(undefined);
      } catch (error) {
        if (error instanceof Error) {
          return Result.fail(
            new ExternalServiceError('MessageBus', error.message, undefined, true)
          );
        }
        return Result.fail(
          new MessageBusError(`Unexpected error publishing to ${topic}: ${String(error)}`)
        );
      }
    });
  }

  async subscribe<T extends IDomainEvent>(
    topic: string,
    handler: (message: T) => Promise<void>,
    options?: SubscribeOptions
  ): Promise<Result<void>> {
    const retryStrategy = options?.retryStrategy || DefaultRetryStrategy;

    return retryStrategy.execute(async () => {
      try {
        const result = await this.doSubscribe(topic, handler, options);
        if (!result.isOk()) {
          return Result.fail(
            new MessageBusError(`Failed to subscribe to ${topic}: ${result.getError().message}`)
          );
        }

        return Result.ok(undefined);
      } catch (error) {
        if (error instanceof Error) {
          return Result.fail(
            new ExternalServiceError('MessageBus', error.message, undefined, true)
          );
        }
        return Result.fail(
          new MessageBusError(`Unexpected error subscribing to ${topic}: ${String(error)}`)
        );
      }
    });
  }

  protected abstract doPublish<T extends IDomainEvent>(
    topic: string,
    message: T,
    options?: PublishOptions
  ): Promise<Result<void>>;

  protected abstract doSubscribe<T extends IDomainEvent>(
    topic: string,
    handler: (message: T) => Promise<void>,
    options?: SubscribeOptions
  ): Promise<Result<void>>;

  protected validateMessage<T extends IDomainEvent>(message: T): Result<void> {
    if (!message.eventType) {
      return Result.fail(new MessageBusError('Message must have an event type'));
    }
    if (!message.aggregateId) {
      return Result.fail(new MessageBusError('Message must have an aggregate ID'));
    }
    return Result.ok(undefined);
  }
}
