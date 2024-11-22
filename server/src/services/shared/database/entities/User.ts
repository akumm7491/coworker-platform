import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Team } from './Team.js';
import { Agent } from './Agent.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Team, team => team.owner)
  ownedTeams: Team[];

  @OneToMany(() => Agent, agent => agent.owner)
  ownedAgents: Agent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  getFullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}
