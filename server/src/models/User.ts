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
  ManyToMany,
} from 'typeorm';
import { eventBus } from '../events/eventBus.js';
import { Event, EventType } from '../events/types.js';
import { Project } from './Project.js';
import { Agent } from './Agent.js';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

export interface UserActivity {
  lastLogin: Date;
  lastActive: Date;
  projectActivity: Array<{
    projectId: string;
    timestamp: Date;
    action: string;
  }>;
  agentActivity: Array<{
    agentId: string;
    timestamp: Date;
    action: string;
  }>;
}

export enum UserProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
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
    if (this.password) {
      // Password hashing is handled by the auth service
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, emailVerificationToken, resetPasswordToken, ...userWithoutSensitiveData } =
      this;
    return userWithoutSensitiveData;
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.emailVerificationToken = undefined;

    const event: Event<{ userId: string }> = {
      id: randomUUID(),
      type: EventType.USER_EMAIL_VERIFIED,
      aggregateId: this.id,
      aggregateType: 'User',
      data: { userId: this.id },
      metadata: {
        userId: this.id,
        timestamp: Date.now(),
        version: 1,
      },
    };

    eventBus.publish(event);
  }

  setResetPasswordToken(token: string, expires: Date): void {
    if (!token) {
      throw new Error('Reset token cannot be empty');
    }

    const now = new Date();
    const maxExpirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    if (expires < now || expires > maxExpirationDate) {
      throw new Error('Reset token expiration must be between now and 24 hours from now');
    }

    this.resetPasswordToken = token;
    this.resetPasswordExpires = expires;
  }

  validateResetPasswordToken(token: string): boolean {
    if (!this.resetPasswordToken || !this.resetPasswordExpires) {
      return false;
    }
    return this.resetPasswordToken === token && this.resetPasswordExpires > new Date();
  }

  clearResetPasswordToken(): void {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
  }

  updatePreferences(preferences: Partial<User['preferences']>): void {
    this.preferences = {
      ...this.preferences,
      ...preferences,
    } as User['preferences'];
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
      this.collaboratedProjects = this.collaboratedProjects.filter(p => p.id !== projectId);
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
      this.agents = this.agents.filter(a => a.id !== agentId);
    }
  }

  trackProjectActivity(projectId: string, action: string): void {
    if (!this.activity) {
      this.activity = {
        lastLogin: new Date(),
        lastActive: new Date(),
        projectActivity: [],
        agentActivity: [],
      };
    }
    this.activity.projectActivity.push({
      projectId,
      timestamp: new Date(),
      action,
    });
    this.activity.lastActive = new Date();
  }

  trackAgentActivity(agentId: string, action: string): void {
    if (!this.activity) {
      this.activity = {
        lastLogin: new Date(),
        lastActive: new Date(),
        projectActivity: [],
        agentActivity: [],
      };
    }
    this.activity.agentActivity.push({
      agentId,
      timestamp: new Date(),
      action,
    });
    this.activity.lastActive = new Date();
  }

  updateLastLogin(): void {
    const activity = this.activity || {
      lastLogin: new Date(),
      lastActive: new Date(),
      projectActivity: [],
      agentActivity: [],
    };
    activity.lastLogin = new Date();
    activity.lastActive = new Date();
    this.activity = activity;
  }
}
