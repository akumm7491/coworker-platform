import { Entity, Column, ManyToMany, ManyToOne, JoinTable, Index } from 'typeorm';
import { BaseEntity } from '@coworker/shared/database/base/BaseEntity';
import {
  AgentStatus,
  AgentRole,
  AgentPerformance,
  AgentLearningModel,
  AgentWorkingMemory,
  AgentCommunication,
} from '@coworker/shared';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { Team } from './team.entity';

@Entity('agents')
export class Agent extends BaseEntity {
  @Column()
  @Index()
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.IDLE,
  })
  status!: AgentStatus;

  @Column({
    type: 'enum',
    enum: AgentRole,
  })
  role!: AgentRole;

  @Column('text', { array: true })
  capabilities!: string[];

  @Column('jsonb')
  performance_metrics!: AgentPerformance;

  @Column('jsonb')
  learning_model!: AgentLearningModel;

  @Column('jsonb')
  working_memory!: AgentWorkingMemory;

  @Column('jsonb')
  communication!: AgentCommunication;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToMany(() => Project, project => project.agents)
  @JoinTable({
    name: 'agent_projects',
    joinColumn: { name: 'agent_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'project_id', referencedColumnName: 'id' },
  })
  projects!: Project[];

  @ManyToMany(() => Task, task => task.assigned_agents)
  @JoinTable({
    name: 'agent_tasks',
    joinColumn: { name: 'agent_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'task_id', referencedColumnName: 'id' },
  })
  tasks!: Task[];

  @ManyToOne(() => Team, team => team.agents)
  team!: Team;
}
