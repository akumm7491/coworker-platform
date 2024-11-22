import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project as SharedProject } from '@coworker/shared';

@Entity()
export class Project implements SharedProject {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: false })
  isArchived!: boolean;

  @Column('simple-array')
  teamMembers!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
