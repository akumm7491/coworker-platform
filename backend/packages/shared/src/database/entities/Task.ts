import { Entity, Column, Index } from 'typeorm';
import { AggregateRoot } from '../base/AggregateRoot';
import { TaskStatus, TaskPriority, TaskType } from '../../types/agent';
import { DomainEvent } from '../../events/definitions/DomainEvent';

@Entity()
export class Task extends AggregateRoot {
  @Column()
  @Index()
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status!: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority!: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.DEVELOPMENT
  })
  type!: TaskType;

  @Column('integer', { default: 0 })
  progress!: number;

  applyEvent(_event: DomainEvent): void {
    // Base implementation - specific event handling is done in service implementations
    throw new Error('Task.applyEvent must be implemented by the service-specific class');
  }
}
