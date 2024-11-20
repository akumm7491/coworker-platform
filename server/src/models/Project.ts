import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User.js';
import { Agent } from './Agent.js';
import { Task } from './Task.js';

export enum ProjectStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  status!: ProjectStatus;

  @Column({ type: 'float', default: 0 })
  completion!: number;

  @Column('simple-array', { nullable: true })
  agents_assigned?: string[];

  @Column({ type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => User, user => user.ownedProjects)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @ManyToMany(() => User, user => user.collaboratedProjects)
  @JoinTable({
    name: 'project_collaborators',
    joinColumn: { name: 'projectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  collaborators!: User[];

  @ManyToMany(() => Agent, agent => agent.projects)
  agents!: Agent[];

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
