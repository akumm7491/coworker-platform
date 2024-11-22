import { Entity, Column, ManyToMany, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { Project as SharedProject } from '@coworker/shared/database/entities/Project';
import {
  ProjectStatus,
  ProjectVision,
  ProjectIntegration,
  ProjectDesignSystem,
  ProjectFeature,
  ProjectAnalytics,
} from '@coworker/shared';
import { Agent } from './agent.entity';
import { Task } from './task.entity';
import { Team } from './team.entity';

@Entity('projects')
export class Project extends SharedProject {
  @Column()
  @Index()
  name!: string;

  @Column('text')
  description!: string;

  @Column('text', { array: true })
  requirements!: string[];

  @Column('jsonb')
  vision!: ProjectVision;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  status!: ProjectStatus;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column('jsonb')
  integrations!: {
    jira?: ProjectIntegration;
    azure_devops?: ProjectIntegration;
    trello?: ProjectIntegration;
    github?: ProjectIntegration;
    [key: string]: ProjectIntegration | undefined;
  };

  @Column('jsonb')
  design_system!: ProjectDesignSystem;

  @Column('jsonb')
  features!: {
    [key: string]: ProjectFeature;
  };

  @Column('jsonb')
  analytics!: ProjectAnalytics;

  @ManyToMany(() => Agent, agent => agent.projects)
  agents!: Agent[];

  @OneToMany(() => Task, task => task.project)
  tasks!: Task[];

  @OneToMany(() => Team, team => team.project)
  teams!: Team[];

  @OneToOne(() => Agent)
  @JoinColumn({ name: 'lead_agent_id' })
  lead_agent!: Agent;
}
