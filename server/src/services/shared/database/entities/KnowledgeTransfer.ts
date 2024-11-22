import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { Agent } from './Agent.js';
import { CollaborationSession } from './CollaborationSession.js';
import { KnowledgeTransferStatus } from '../../../agent/types/KnowledgeTransferStatus.js';

@Entity()
export class KnowledgeTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CollaborationSession, session => session.knowledgeTransfers)
  @JoinColumn({ name: 'session_id' })
  session: CollaborationSession;

  @ManyToOne(() => Agent, agent => agent.knowledgeTransferred)
  @JoinColumn({ name: 'source_agent_id' })
  sourceAgent: Agent;

  @ManyToOne(() => Agent, agent => agent.knowledgeReceived)
  @JoinColumn({ name: 'target_agent_id' })
  targetAgent: Agent;

  @Column({ type: 'json' })
  knowledge: Record<string, any>;

  @Column({
    type: 'enum',
    enum: KnowledgeTransferStatus,
    default: KnowledgeTransferStatus.PENDING
  })
  status: KnowledgeTransferStatus;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  updateStatus(status: KnowledgeTransferStatus): void {
    this.status = status;
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
