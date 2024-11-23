import { EntityManager, FindOptionsWhere, Repository, DeepPartial } from 'typeorm';
import { EventBus } from '@nestjs/cqrs';

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  transaction<R>(operation: (entityManager: EntityManager) => Promise<R>): Promise<R>;
}

export abstract class BaseRepository<T extends { id: string }> implements IBaseRepository<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly eventBus: EventBus,
    protected readonly entityManager: EntityManager
  ) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async save(entity: T): Promise<T> {
    const savedEntity = await this.repository.save(entity as DeepPartial<T>);

    // If entity has domain events, publish them
    if ('domainEvents' in entity && Array.isArray((entity as any).domainEvents)) {
      const events = (entity as any).domainEvents;
      events.forEach(event => this.eventBus.publish(event));
      (entity as any).clearDomainEvents?.();
    }

    return savedEntity;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async transaction<R>(operation: (entityManager: EntityManager) => Promise<R>): Promise<R> {
    return this.entityManager.transaction(operation);
  }
}
