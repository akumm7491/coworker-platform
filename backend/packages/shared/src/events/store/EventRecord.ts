import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { EventType } from '../definitions/DomainEvent';

@Entity('event_store')
export class EventRecord {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar'
    })
    eventType!: EventType;

    @Column({
        type: 'uuid'
    })
    aggregateId!: string;

    @Column({
        type: 'integer'
    })
    version!: number;

    @Column('jsonb')
    data!: Record<string, unknown>;

    @CreateDateColumn()
    createdAt!: Date;
}
