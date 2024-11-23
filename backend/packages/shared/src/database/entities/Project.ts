import { Entity, Column, Index } from 'typeorm';
import { AggregateRoot } from '../base/AggregateRoot';
import { ProjectStatus } from '../../types/agent';
import { DomainEvent } from '../../events/definitions/DomainEvent';

@Entity()
export class Project extends AggregateRoot {
  @Column()
  @Index()
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING
  })
  status!: ProjectStatus;

  @Column('timestamp', { nullable: true })
  start_date?: Date;

  @Column('timestamp', { nullable: true })
  completion_date?: Date;

  @Column('timestamp', { nullable: true })
  deadline?: Date;

  applyEvent(_event: DomainEvent): void {
    // Base implementation - specific event handling is done in service implementations
    throw new Error('Project.applyEvent must be implemented by the service-specific class');
  }
}
