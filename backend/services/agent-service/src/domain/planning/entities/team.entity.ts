import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '@coworker/shared/database/base/BaseEntity';
import { Agent } from './agent.entity';
import { Project } from './project.entity';

@Entity('teams')
export class Team extends BaseEntity {
  @Column()
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @OneToMany(() => Agent, agent => agent.team)
  agents!: Agent[];

  @ManyToOne(() => Project, project => project.teams)
  project!: Project;
}
