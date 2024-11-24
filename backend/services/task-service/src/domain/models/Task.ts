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
import { ApiProperty } from '@nestjs/swagger';

@Entity('tasks')
export class Task extends AggregateRoot {
  @ApiProperty({ description: 'Unique identifier of the task' })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Title of the task', minLength: 3 })
  @Column()
  @IsNotEmpty()
  @MinLength(3)
  title!: string;

  @ApiProperty({ description: 'Description of the task', required: false })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Current status of the task',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus = TaskStatus.TODO;

  @ApiProperty({
    description: 'Priority level of the task',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  priority: TaskPriority = TaskPriority.MEDIUM;

  @ApiProperty({ description: 'ID of the user who created the task' })
  @Column('uuid')
  @IsUUID()
  createdById!: string;

  @ApiProperty({ description: 'ID of the user assigned to the task', required: false })
  @Column('uuid', { nullable: true })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ description: 'Due date for the task', required: false })
  @Column('timestamp with time zone', { nullable: true })
  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({
    description: 'Array of labels/tags associated with the task',
    type: [String],
    default: [],
  })
  @Column('simple-array', { default: [] })
  labels: string[] = [];

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
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
