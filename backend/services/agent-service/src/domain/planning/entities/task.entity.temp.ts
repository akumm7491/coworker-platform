import { Entity, Column, ManyToMany, ManyToOne, JoinTable, Index } from 'typeorm';
import { BaseEntity } from '@coworker/shared/dist/database/base/BaseEntity';
import {
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskRequirements,
  TaskDependencies,
  TaskExecutionPlan,
  TaskValidationResult,
  TaskMetrics,
} from '@coworker/shared/dist/types/agent';
import { Agent } from './agent.entity';
import { Project } from './project.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  @Index()
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.DEVELOPMENT,
  })
  type!: TaskType;

  @Column('float')
  progress!: number;

  @Column('jsonb')
  requirements!: TaskRequirements;

  @Column('jsonb')
  dependencies!: TaskDependencies;

  @Column('jsonb')
  execution_plan!: TaskExecutionPlan;

  @Column('jsonb', { array: true })
  validation_results!: TaskValidationResult[];

  @Column('jsonb')
  metrics!: TaskMetrics;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column('text', { array: true })
  tags!: string[];

  @ManyToOne(() => Project, project => project.tasks)
  project!: Project;

  @ManyToMany(() => Agent, agent => agent.tasks)
  assigned_agents!: Agent[];

  // Convert Date to string for createdAt
  get createdAt(): string {
    return this._createdAt.toISOString();
  }

  set createdAt(value: string) {
    this._createdAt = new Date(value);
  }

  @Column('timestamp with time zone')
  private _createdAt!: Date;
}
