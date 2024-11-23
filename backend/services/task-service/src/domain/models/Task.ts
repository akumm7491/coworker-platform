import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDate, MinLength } from 'class-validator';
import { TaskStatus, TaskPriority } from './TaskStatus';
import { AggregateRoot } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

@Entity('tasks')
export class Task extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id!: string;

  @Column()
  @IsNotEmpty()
  @MinLength(3)
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus = TaskStatus.TODO;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  priority: TaskPriority = TaskPriority.MEDIUM;

  @Column('uuid')
  @IsUUID()
  createdById!: string;

  @Column('uuid', { nullable: true })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @Column('timestamp with time zone', { nullable: true })
  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @Column('simple-array', { default: [] })
  labels: string[] = [];

  @CreateDateColumn()
  @IsDate()
  createdAt!: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  constructor(params?: {
    title: string;
    description?: string;
    createdById: string;
    assigneeId?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    labels?: string[];
  }) {
    super();
    if (params) {
      this.title = params.title;
      this.description = params.description;
      this.createdById = params.createdById;
      this.assigneeId = params.assigneeId;
      this.priority = params.priority || TaskPriority.MEDIUM;
      this.dueDate = params.dueDate;
      this.labels = params.labels || [];
      this.status = TaskStatus.TODO;
    }
  }

  assignTo(assigneeId: string) {
    this.assigneeId = assigneeId;
  }

  updateStatus(status: TaskStatus) {
    this.status = status;
  }

  updatePriority(priority: TaskPriority) {
    this.priority = priority;
  }

  updateDueDate(dueDate: Date) {
    this.dueDate = dueDate;
  }

  addLabel(label: string) {
    if (!this.labels.includes(label)) {
      this.labels.push(label);
    }
  }

  removeLabel(label: string) {
    this.labels = this.labels.filter(l => l !== label);
  }

  update(params: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: Date;
    labels?: string[];
  }) {
    if (params.title) this.title = params.title;
    if (params.description !== undefined) this.description = params.description;
    if (params.status) this.status = params.status;
    if (params.priority) this.priority = params.priority;
    if (params.assigneeId !== undefined) this.assigneeId = params.assigneeId;
    if (params.dueDate !== undefined) this.dueDate = params.dueDate;
    if (params.labels) this.labels = params.labels;
  }
}
