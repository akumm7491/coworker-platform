import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Task } from './Task.js';
import { Agent } from './Agent.js';
import { TaskArtifact } from './TaskArtifact.js';

@Entity('task_executions')
export class TaskExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, task => task.executions)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => Agent, agent => agent.taskExecutions)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

  @Column('text', { nullable: true })
  error?: string;

  @Column('jsonb', { nullable: true })
  result?: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metrics?: {
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    resourceUsage?: {
      cpu?: number;
      memory?: number;
    };
  };

  @OneToMany(() => TaskArtifact, artifact => artifact.taskExecution)
  artifacts: TaskArtifact[];

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
