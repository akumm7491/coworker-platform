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
import { Team } from './Team.js';
import { TaskExecution } from './TaskExecution.js';
import { KnowledgeTransfer } from './KnowledgeTransfer.js';
import { AgentRole } from '../../../agent/types/AgentRole.js';
import { AgentCapability } from '../../../agent/types/AgentCapability.js';
import { AgentStatus } from '../../../agent/types/AgentStatus.js';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Team, team => team.agents)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column('simple-array')
  roles: AgentRole[];

  @Column('simple-array')
  capabilities: AgentCapability[];

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.IDLE,
  })
  status: AgentStatus;

  @Column({ default: true })
  isAvailable: boolean;

  @OneToMany(() => TaskExecution, execution => execution.agent)
  taskExecutions: TaskExecution[];

  @OneToMany(() => KnowledgeTransfer, transfer => transfer.sourceAgent)
  knowledgeTransferred: KnowledgeTransfer[];

  @OneToMany(() => KnowledgeTransfer, transfer => transfer.targetAgent)
  knowledgeReceived: KnowledgeTransfer[];

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metrics: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  hasRole(role: AgentRole): boolean {
    return this.roles.includes(role);
  }

  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.includes(capability);
  }

  addRole(role: AgentRole): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
  }

  removeRole(role: AgentRole): void {
    this.roles = this.roles.filter(r => r !== role);
  }

  addCapability(capability: AgentCapability): void {
    if (!this.capabilities.includes(capability)) {
      this.capabilities.push(capability);
    }
  }

  removeCapability(capability: AgentCapability): void {
    this.capabilities = this.capabilities.filter(c => c !== capability);
  }

  updateStatus(status: AgentStatus): void {
    this.status = status;
  }

  updateMetrics(metrics: Record<string, any>): void {
    this.metrics = { ...this.metrics, ...metrics };
  }
}
