import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Agent } from './Agent.js';
import { Task } from './Task.js';

@Entity('knowledge_items')
export class KnowledgeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column('text')
  content: string;

  @Column('json', { nullable: true })
  context?: Record<string, any>;

  @Column('simple-array')
  tags: string[];

  @Column()
  source: string;

  @Column()
  confidence: number;

  @ManyToOne(() => Agent)
  agent: Agent;

  @ManyToMany(() => Task)
  @JoinTable()
  relatedTasks: Task[];

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  expiresAt?: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
