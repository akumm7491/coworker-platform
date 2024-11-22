import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { KnowledgeTransfer } from './KnowledgeTransfer.js';
import { Agent } from './Agent.js';
import { CollaborationSessionStatus } from '../../../agent/types/CollaborationSessionStatus.js';

@Entity()
export class CollaborationSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CollaborationSessionStatus,
    default: CollaborationSessionStatus.ACTIVE
  })
  status: CollaborationSessionStatus;

  @ManyToMany(() => Agent)
  @JoinTable({
    name: 'collaboration_session_agents',
    joinColumn: {
      name: 'session_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'agent_id',
      referencedColumnName: 'id'
    }
  })
  agents: Agent[];

  @OneToMany(() => KnowledgeTransfer, transfer => transfer.session)
  knowledgeTransfers: KnowledgeTransfer[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  updateStatus(status: CollaborationSessionStatus): void {
    this.status = status;
  }

  addAgent(agent: Agent): void {
    if (!this.agents) {
      this.agents = [];
    }
    if (!this.agents.find(a => a.id === agent.id)) {
      this.agents.push(agent);
    }
  }

  removeAgent(agentId: number): void {
    if (this.agents) {
      this.agents = this.agents.filter(a => a.id !== agentId);
    }
  }

  addKnowledgeTransfer(transfer: KnowledgeTransfer): void {
    if (!this.knowledgeTransfers) {
      this.knowledgeTransfers = [];
    }
    this.knowledgeTransfers.push(transfer);
    transfer.session = this;
  }

  addMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata?.[key];
  }
}
