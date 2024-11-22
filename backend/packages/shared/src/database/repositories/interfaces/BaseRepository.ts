import { EntityManager, FindOptionsWhere, Repository as TypeORMRepository, DeepPartial } from 'typeorm';
import { DomainEvent } from '../../../events/definitions/DomainEvent';
import { EventStore } from '../../../events/store/EventStore';
import { AggregateRoot } from '../../base/AggregateRoot';

export abstract class BaseRepository<T extends AggregateRoot> {
    constructor(
        protected readonly repository: TypeORMRepository<T>,
        protected readonly entityManager: EntityManager,
        protected readonly eventStore: EventStore
    ) {}

    async findById(id: string): Promise<T | null> {
        return this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
    }

    async findAll(): Promise<T[]> {
        return this.repository.find();
    }

    async findByIds(ids: string[]): Promise<T[]> {
        return this.repository.findByIds(ids);
    }

    async save(entity: T): Promise<T> {
        const savedEntity = await this.repository.save(entity);
        if (entity.domainEvents.length > 0) {
            await this.eventStore.saveEvents(entity.id, entity.domainEvents);
            entity.clearDomainEvents();
        }
        return savedEntity;
    }

    async update(id: string, entityData: DeepPartial<T>): Promise<T> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Entity with id ${id} not found`);
        }
        
        // Filter out AggregateRoot properties
        const aggregateRootProps = new Set(['_domainEvents', 'domainEvents', 'clearDomainEvents', 'applyEvent']);
        const safeEntityData = Object.fromEntries(
            Object.entries(entityData).filter(([key]) => !aggregateRootProps.has(key))
        ) as DeepPartial<T>;

        const merged = this.repository.merge(existing, safeEntityData);
        return this.save(merged);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async exists(id: string): Promise<boolean> {
        return (await this.repository.count({ where: { id } as FindOptionsWhere<T> })) > 0;
    }

    async beginTransaction(): Promise<void> {
        await this.entityManager.queryRunner?.startTransaction();
    }

    async commitTransaction(): Promise<void> {
        await this.entityManager.queryRunner?.commitTransaction();
    }

    async rollbackTransaction(): Promise<void> {
        await this.entityManager.queryRunner?.rollbackTransaction();
    }

    async withTransaction<R>(operation: () => Promise<R>): Promise<R> {
        try {
            await this.beginTransaction();
            const result = await operation();
            await this.commitTransaction();
            return result;
        } catch (error) {
            await this.rollbackTransaction();
            throw error;
        }
    }

    async query(criteria: Record<string, unknown>): Promise<T[]> {
        return this.repository.find({ where: criteria as FindOptionsWhere<T> });
    }

    async count(criteria: Record<string, unknown>): Promise<number> {
        return this.repository.count({ where: criteria as FindOptionsWhere<T> });
    }

    async paginate(page: number, limit: number, criteria?: Record<string, unknown>): Promise<{
        items: T[];
        total: number;
        page: number;
        pages: number;
    }> {
        const [items, total] = await this.repository.findAndCount({
            where: criteria as FindOptionsWhere<T>,
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            items,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }

    protected async getEvents(id: string): Promise<DomainEvent[]> {
        return this.eventStore.getEvents(id);
    }

    protected async saveEvents(id: string, events: DomainEvent[]): Promise<void> {
        await this.eventStore.saveEvents(id, events);
    }

    protected async replay(id: string): Promise<T> {
        const events = await this.getEvents(id);
        const entity = await this.findById(id);
        if (!entity) {
            throw new Error(`Entity with id ${id} not found`);
        }

        events.forEach(event => {
            entity.applyEvent(event);
        });

        return entity;
    }
}
