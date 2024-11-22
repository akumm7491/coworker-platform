import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { Task } from './Task.js';
import { TaskExecution } from './TaskExecution.js';
import { ArtifactType } from '../../../agent/types/ArtifactType.js';

@Entity('task_artifacts')
export class TaskArtifact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ArtifactType,
    default: ArtifactType.OTHER
  })
  type: ArtifactType;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text')
  location: string;

  @Column('bigint')
  size: number;

  @Column('text', { nullable: true })
  mimeType?: string;

  @Column('text', { nullable: true })
  checksum?: string;

  @ManyToOne(() => Task, task => task.artifacts)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => TaskExecution, execution => execution.artifacts)
  @JoinColumn({ name: 'task_execution_id' })
  taskExecution: TaskExecution;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
