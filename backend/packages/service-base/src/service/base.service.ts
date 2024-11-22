import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Repository,
  EntityManager,
  QueryRunner,
  SelectQueryBuilder,
  ObjectLiteral,
  DeepPartial,
} from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '@coworker/shared/dist/events/definitions/DomainEvent';
import { EventStore } from '@coworker/shared/dist/events/store/EventStore';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';
import { PaginationParams } from '../interfaces/pagination-params.interface';

type EventHandler = (event: DomainEvent) => Promise<void>;

@Injectable()
export abstract class BaseService<T extends ObjectLiteral> {
  protected readonly logger: Logger;
  protected eventHandlers: Map<string, EventHandler[]> = new Map();

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly eventStore: EventStore
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  // Event handling methods
  protected registerEventHandler(eventType: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.push(handler);
      this.eventEmitter.on(eventType, handler);
    }
  }

  protected async publishEvent(event: DomainEvent): Promise<void> {
    await this.eventStore.saveEvent(event);
    this.eventEmitter.emit(event.eventType, event);
  }

  // Transaction management
  protected async withTransaction<R>(
    operation: (entityManager: EntityManager) => Promise<R>
  ): Promise<R> {
    const queryRunner: QueryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Lifecycle hooks
  protected async beforeSave(_entity: DeepPartial<T>): Promise<void> {
    // Override in derived classes if needed
  }

  protected async afterSave(_entity: T): Promise<void> {
    // Override in derived classes if needed
  }

  protected async beforeDelete(_id: string | number): Promise<void> {
    // Override in derived classes if needed
  }

  protected async afterDelete(_id: string | number): Promise<void> {
    // Override in derived classes if needed
  }

  // CRUD operations
  async create(data: DeepPartial<T>): Promise<T> {
    await this.beforeSave(data);
    const entity = this.repository.create(data);
    const savedEntity = await this.repository.save(entity);
    await this.afterSave(savedEntity);
    return savedEntity;
  }

  async findOne(id: string | number): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResponse<T>> {
    const [items, total] = await this.repository.findAndCount({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      items,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async update(id: string | number, data: DeepPartial<T>): Promise<T> {
    // Verify entity exists
    await this.findOne(id);
    await this.beforeSave(data);
    await this.repository.update(id, data as any);
    const updatedEntity = await this.findOne(id);
    await this.afterSave(updatedEntity);
    return updatedEntity;
  }

  async delete(id: string | number): Promise<void> {
    // Verify entity exists
    await this.findOne(id);
    await this.beforeDelete(id);
    await this.repository.delete(id);
    await this.afterDelete(id);
  }

  // Query builder helper
  protected getQueryBuilder(): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder();
  }
}
