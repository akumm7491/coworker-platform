import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class AgentMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  agentId: string;

  @Index()
  @Column()
  type: string;

  @Column('float')
  value: number;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Index()
  @CreateDateColumn()
  timestamp: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
