import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgentRole } from '../types/AgentRole.js';
import { AgentStatus } from '../types/AgentStatus.js';
import { AgentCapability } from '../types/AgentCapability.js';
import { CollaborationSession } from '../../shared/database/entities/CollaborationSession.js';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: AgentRole,
    default: AgentRole.ASSISTANT,
  })
  role!: AgentRole;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.AVAILABLE,
  })
  status!: AgentStatus;

  @Column({
    type: 'enum',
    enum: AgentCapability,
    array: true,
    default: [],
  })
  capabilities!: AgentCapability[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToMany(
    () => CollaborationSession,
    (session) => session.agents,
    { cascade: true },
  )
  @JoinTable()
  sessions!: CollaborationSession[];

  constructor() {
    this.capabilities = [];
    this.sessions = [];
  }

  addSession(session: CollaborationSession): void {
    if (!this.sessions.find((s) => s.id === session.id)) {
      this.sessions.push(session);
    }
  }

  removeSession(sessionId: string): void {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
  }

  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.includes(capability);
  }

  addCapability(capability: AgentCapability): void {
    if (!this.hasCapability(capability)) {
      this.capabilities.push(capability);
    }
  }

  removeCapability(capability: AgentCapability): void {
    this.capabilities = this.capabilities.filter((c) => c !== capability);
  }

  updateMetadata(key: string, value: unknown): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  getMetadata<T>(key: string): T | undefined {
    return this.metadata?.[key] as T | undefined;
  }
}
