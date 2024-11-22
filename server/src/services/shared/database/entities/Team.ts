import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';
import { Agent } from './Agent.js';
import { TeamRole } from '../../../agent/types/TeamRole.js';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Agent, agent => agent.team)
  agents: Agent[];

  @Column('simple-array')
  roles: TeamRole[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  addAgent(agent: Agent): void {
    if (!this.agents) {
      this.agents = [];
    }
    this.agents.push(agent);
    agent.team = this;
  }

  removeAgent(agentId: number): void {
    if (!this.agents) return;
    this.agents = this.agents.filter(agent => agent.id !== agentId);
  }

  hasRole(role: TeamRole): boolean {
    return this.roles.includes(role);
  }

  addRole(role: TeamRole): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
  }

  removeRole(role: TeamRole): void {
    this.roles = this.roles.filter(r => r !== role);
  }
}
