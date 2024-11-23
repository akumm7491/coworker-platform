import { Result } from '../../common/Result';
import { IEventBus } from '../events/EventBus';
import { AggregateRoot } from '../base/AggregateRoot';
import { IDomainRepository } from '../repositories/Repository';
import { QueryRunner } from 'typeorm';

/**
 * Base service for domain operations
 * Handles domain event publishing and provides common domain-level functionality
 */
export abstract class DomainService {
  constructor(protected readonly eventBus: IEventBus) {}

  protected async publishEvents<T extends AggregateRoot>(result: Result<T>): Promise<Result<T>> {
    if (result.isOk()) {
      const entity = result.getValue();
      const events = entity.getDomainEvents();
      for (const event of events) {
        await this.eventBus.publish(event);
      }
      entity.clearDomainEvents();
    }
    return result;
  }
}

/**
 * Base service for operations on domain entities
 * Provides transaction management and repository integration
 */
export abstract class EntityDomainService<TEntity extends AggregateRoot> extends DomainService {
  constructor(
    eventBus: IEventBus,
    protected readonly repository: IDomainRepository<TEntity>
  ) {
    super(eventBus);
  }

  protected async withTransaction<R>(
    operation: (queryRunner: QueryRunner) => Promise<Result<R>>
  ): Promise<Result<R>> {
    return this.repository.withTransaction(operation);
  }
}
