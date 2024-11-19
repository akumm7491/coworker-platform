import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToMany
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Project } from './Project.js';
import { Agent } from './Agent.js';
import logger from '../utils/logger.js';

interface UserActivity {
  lastLogin?: Date;
  lastActive?: Date;
  projectActivity?: Array<{
    projectId: string;
    timestamp: Date;
    action: string;
  }>;
  agentActivity?: Array<{
    agentId: string;
    timestamp: Date;
    action: string;
  }>;
}

export enum UserProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  githubId?: string;

  @Column({
    type: 'enum',
    enum: UserProvider,
    default: UserProvider.LOCAL,
  })
  provider!: UserProvider;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: true,
      },
      language: 'en',
      timezone: 'UTC',
    },
  })
  preferences!: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
    language: string;
    timezone: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  activity?: UserActivity;

  @OneToMany(() => Project, project => project.owner)
  ownedProjects!: Project[];

  @ManyToMany(() => Project, project => project.collaborators)
  collaboratedProjects!: Project[];

  @OneToMany(() => Agent, agent => agent.owner)
  agents!: Agent[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @VersionColumn()
  version!: number;

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsert(): Promise<void> {
    if (this.password && !this.password.startsWith('$2b$')) {
      // Only hash if password is not already hashed
      this.password = await bcrypt.hash(this.password, 10);
      logger.info('Password hashed in User model beforeInsert hook');
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON(): Omit<
    User,
    | 'password'
    | 'emailVerificationToken'
    | 'resetPasswordToken'
    | 'beforeInsert'
    | 'beforeUpdate'
    | 'toJSON'
    | 'verifyEmail'
    | 'setResetPasswordToken'
    | 'validateResetPasswordToken'
    | 'clearResetPasswordToken'
    | 'updatePreferences'
    | 'addOwnedProject'
    | 'addCollaboratedProject'
    | 'removeCollaboratedProject'
    | 'addAgent'
    | 'removeAgent'
    | 'trackProjectActivity'
    | 'trackAgentActivity'
    | 'updateLastLogin'
    | 'comparePassword'
  > {
    const user = { ...this };
    delete user.password;
    delete user.emailVerificationToken;
    delete user.resetPasswordToken;
    return user;
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.emailVerificationToken = undefined;
  }

  setResetPasswordToken(token: string, expires: Date): void {
    this.resetPasswordToken = token;
    this.resetPasswordExpires = expires;
  }

  validateResetPasswordToken(token: string): boolean {
    return (
      this.resetPasswordToken === token &&
      this.resetPasswordExpires &&
      this.resetPasswordExpires > new Date()
    );
  }

  clearResetPasswordToken(): void {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
  }

  updatePreferences(preferences: Partial<User['preferences']>): void {
    this.preferences = {
      ...this.preferences,
      ...preferences,
    };
  }

  addOwnedProject(project: Project): void {
    if (!this.ownedProjects) {
      this.ownedProjects = [];
    }
    this.ownedProjects.push(project);
  }

  addCollaboratedProject(project: Project): void {
    if (!this.collaboratedProjects) {
      this.collaboratedProjects = [];
    }
    this.collaboratedProjects.push(project);
  }

  removeCollaboratedProject(projectId: string): void {
    if (this.collaboratedProjects) {
      this.collaboratedProjects = this.collaboratedProjects.filter(
        project => project.id !== projectId
      );
    }
  }

  addAgent(agent: Agent): void {
    if (!this.agents) {
      this.agents = [];
    }
    this.agents.push(agent);
  }

  removeAgent(agentId: string): void {
    if (this.agents) {
      this.agents = this.agents.filter(agent => agent.id !== agentId);
    }
  }

  trackProjectActivity(projectId: string, action: string): void {
    if (!this.activity) {
      this.activity = {};
    }
    if (!this.activity.projectActivity) {
      this.activity.projectActivity = [];
    }
    this.activity.projectActivity.push({
      projectId,
      timestamp: new Date(),
      action,
    });
  }

  trackAgentActivity(agentId: string, action: string): void {
    if (!this.activity) {
      this.activity = {};
    }
    if (!this.activity.agentActivity) {
      this.activity.agentActivity = [];
    }
    this.activity.agentActivity.push({
      agentId,
      timestamp: new Date(),
      action,
    });
  }

  updateLastLogin(): void {
    if (!this.activity) {
      this.activity = {};
    }
    this.activity.lastLogin = new Date();
    this.activity.lastActive = new Date();
  }
}
