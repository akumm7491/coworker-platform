import { Entity, Column } from 'typeorm';
import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDate, MinLength } from 'class-validator';
import { TaskStatus, TaskPriority } from './TaskStatus';
import { randomUUID } from 'crypto';

@Entity('tasks')
export class Task {
  @Column('uuid', { primary: true })
  @IsUUID()
  id: string;

  @Column()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @Column('uuid', { nullable: true })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @Column('uuid')
  @IsUUID()
  createdById: string;

  @Column('timestamp with time zone')
  @IsDate()
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @Column('timestamp with time zone', { nullable: true })
  @IsDate()
  @IsOptional()
  completedAt?: Date;

  @Column('simple-array', { nullable: true })
  @IsUUID(undefined, { each: true })
  @IsOptional()
  labels?: string[];

  constructor(props: {
    title: string;
    createdById: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: Date;
    labels?: string[];
  }) {
    this.id = randomUUID();
    this.title = props.title;
    this.description = props.description;
    this.status = props.status || TaskStatus.TODO;
    this.priority = props.priority || TaskPriority.MEDIUM;
    this.assigneeId = props.assigneeId;
    this.createdById = props.createdById;
    this.createdAt = new Date();
    this.dueDate = props.dueDate;
    this.labels = props.labels;
  }

  assign(assigneeId: string): void {
    this.assigneeId = assigneeId;
    if (this.status === TaskStatus.TODO) {
      this.status = TaskStatus.IN_PROGRESS;
    }
  }

  unassign(): void {
    this.assigneeId = undefined;
    if (this.status === TaskStatus.IN_PROGRESS) {
      this.status = TaskStatus.TODO;
    }
  }

  updateStatus(status: TaskStatus): void {
    this.status = status;
    if (status === TaskStatus.DONE) {
      this.completedAt = new Date();
    } else {
      this.completedAt = undefined;
    }
  }

  updatePriority(priority: TaskPriority): void {
    this.priority = priority;
  }

  updateDueDate(dueDate?: Date): void {
    this.dueDate = dueDate;
  }

  addLabel(labelId: string): void {
    if (!this.labels) {
      this.labels = [];
    }
    if (!this.labels.includes(labelId)) {
      this.labels.push(labelId);
    }
  }

  removeLabel(labelId: string): void {
    if (this.labels) {
      this.labels = this.labels.filter(id => id !== labelId);
    }
  }

  update(updates: {
    title?: string;
    description?: string;
    assigneeId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date;
    labels?: string[];
  }): void {
    if (updates.title) {
      this.title = updates.title;
    }
    if (updates.description !== undefined) {
      this.description = updates.description;
    }
    if (updates.assigneeId !== undefined) {
      if (updates.assigneeId) {
        this.assign(updates.assigneeId);
      } else {
        this.unassign();
      }
    }
    if (updates.status) {
      this.updateStatus(updates.status);
    }
    if (updates.priority) {
      this.updatePriority(updates.priority);
    }
    if (updates.dueDate !== undefined) {
      this.updateDueDate(updates.dueDate);
    }
    if (updates.labels) {
      this.labels = [...updates.labels];
    }
  }
}
