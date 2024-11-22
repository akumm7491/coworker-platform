import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { User } from './User.js';
import { Agent } from './Agent.js';
import { TaskExecution } from './TaskExecution.js';
import { TaskArtifact } from './TaskArtifact.js';
import { TaskStatus } from '../../../agent/types/TaskStatus.js';
import { TaskPriority } from '../../../agent/types/TaskPriority.js';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'assigned_agent_id' })
  assignedAgent: Agent;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @Column('jsonb', { nullable: true })
  parameters?: Record<string, any>;

  @Column('jsonb', { nullable: true })
  requirements?: {
    capabilities?: string[];
    resources?: {
      minCpu?: number;
      minMemory?: number;
      minStorage?: number;
    };
  };

  @OneToMany(() => TaskExecution, execution => execution.task)
  executions: TaskExecution[];

  @OneToMany(() => TaskArtifact, artifact => artifact.task)
  artifacts: TaskArtifact[];

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  addExecution(execution: TaskExecution): void {
    if (!this.executions) {
      this.executions = [];
    }
    this.executions.push(execution);
    execution.task = this;
  }

  addArtifact(artifact: TaskArtifact): void {
    if (!this.artifacts) {
      this.artifacts = [];
    }
    this.artifacts.push(artifact);
    artifact.task = this;
  }
}
