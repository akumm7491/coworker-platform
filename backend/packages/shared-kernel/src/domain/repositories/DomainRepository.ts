import { QueryRunner, DataSource } from 'typeorm';
import { AggregateRoot } from '../base/AggregateRoot';
import { Result } from '../../common/Result';
import { IEventBus } from '../events/EventBus';

/**
 * Core repository interface for domain-driven design
 * Provides a domain-centric abstraction for persisting and retrieving aggregate roots
 */
export interface IDomainRepository<T extends AggregateRoot> {
  findById(id: string, queryRunner?: QueryRunner): Promise<Result<T>>;
  findByIds(ids: string[], queryRunner?: QueryRunner): Promise<Result<T[]>>;
  save(entity: T, queryRunner?: QueryRunner): Promise<Result<T>>;
  saveMany(entities: T[], queryRunner?: QueryRunner): Promise<Result<T[]>>;
  delete(id: string, queryRunner?: QueryRunner): Promise<Result<void>>;
  exists(id: string, queryRunner?: QueryRunner): Promise<Result<boolean>>;

  withTransaction<R>(
    operation: (queryRunner: QueryRunner) => Promise<Result<R>>
  ): Promise<Result<R>>;

  publishEvents(entity: T): Promise<void>;
}

/**
 * Base domain repository implementation with proper error handling and event publishing
 * Follows DDD principles for handling aggregate roots and domain events
 */
export abstract class BaseDomainRepository<T extends AggregateRoot>
  implements IDomainRepository<T>
{
  protected readonly logger: Console;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly eventBus: IEventBus,
    logger: Console = console
  ) {
    this.logger = logger;
  }

  abstract findById(id: string, queryRunner?: QueryRunner): Promise<Result<T>>;
  abstract findByIds(ids: string[], queryRunner?: QueryRunner): Promise<Result<T[]>>;
  abstract save(entity: T, queryRunner?: QueryRunner): Promise<Result<T>>;
  abstract saveMany(entities: T[], queryRunner?: QueryRunner): Promise<Result<T[]>>;
  abstract delete(id: string, queryRunner?: QueryRunner): Promise<Result<void>>;
  abstract exists(id: string, queryRunner?: QueryRunner): Promise<Result<boolean>>;

  async withTransaction<R>(
    operation: (queryRunner: QueryRunner) => Promise<Result<R>>
  ): Promise<Result<R>> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const result = await operation(queryRunner);

      if (result.isOk()) {
        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Transaction failed:', error);
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    } finally {
      await queryRunner.release();
    }
  }

  protected async withTransactionContext<R>(
    queryRunner: QueryRunner | undefined,
    operation: (qr: QueryRunner) => Promise<Result<R>>
  ): Promise<Result<R>> {
    if (queryRunner) {
      return operation(queryRunner);
    }
    return this.withTransaction(operation);
  }

  async publishEvents(entity: T): Promise<void> {
    if (!this.eventBus) {
      this.logger.warn('No event bus configured for repository');
      return;
    }

    const events = entity.getDomainEvents();
    const publishPromises = events.map(event =>
      this.eventBus.publish(event).catch(error => {
        this.logger.error(`Failed to publish event ${event.eventType}:`, error);
        throw error;
      })
    );

    try {
      await Promise.all(publishPromises);
      entity.clearDomainEvents();
    } catch (error) {
      this.logger.error('Failed to publish domain events:', error);
      throw error;
    }
  }

  protected formatError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }
}
