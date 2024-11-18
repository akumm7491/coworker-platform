import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from './User.js';
import { Project } from './Project.js';

export enum AgentStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  TRAINING = 'training',
  DEPLOYED = 'deployed',
  ERROR = 'error',
}

export enum AgentType {
  GENERAL = 'general',
  SPECIALIZED = 'specialized',
  CUSTOM = 'custom',
}

export enum AgentScope {
  PROJECT = 'project',
  ORGANIZATION = 'organization',
  GLOBAL = 'global',
}

@Entity()
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.IDLE,
  })
  status!: AgentStatus;

  @Column({
    type: 'enum',
    enum: AgentType,
    default: AgentType.GENERAL,
  })
  type!: AgentType;

  @Column({
    type: 'enum',
    enum: AgentScope,
    default: AgentScope.PROJECT,
  })
  scope!: AgentScope;

  @Column()
  ownerId!: string;

  @ManyToOne(() => User, user => user.agents)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @ManyToMany(() => Project, project => project.agents)
  @JoinTable({
    name: 'agent_projects',
    joinColumn: { name: 'agentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'projectId', referencedColumnName: 'id' },
  })
  projects!: Project[];

  @Column({
    type: 'jsonb',
    nullable: false,
    default: {
      skills: [],
      languages: [],
      tools: [],
      apis: [],
      permissions: [],
      concurrency: {
        maxProjects: 5,
        maxTasksPerProject: 10,
      },
    },
  })
  capabilities!: {
    skills: string[];
    languages: string[];
    tools: string[];
    apis: string[];
    permissions: string[];
    concurrency: {
      maxProjects: number;
      maxTasksPerProject: number;
    };
  };

  @Column({
    type: 'jsonb',
    nullable: false,
    default: {
      maxConcurrentTasks: 5,
      timeout: 300000,
      retryAttempts: 3,
      priority: 1,
      notificationPreferences: {
        email: true,
        slack: false,
      },
    },
  })
  settings!: {
    maxConcurrentTasks: number;
    timeout: number;
    retryAttempts: number;
    priority: number;
    notificationPreferences: {
      email: boolean;
      slack: boolean;
      webhook?: string;
    };
    projectSpecificSettings?: Record<
      string,
      {
        priority: number;
        customSettings?: Record<string, unknown>;
      }
    >;
    customSettings?: Record<string, unknown>;
  };

  @Column({
    type: 'jsonb',
    nullable: false,
    default: {
      tasksCompleted: 0,
      successRate: 0,
      averageResponseTime: 0,
      lastNTasks: [],
      projectMetrics: {},
      metrics: {},
    },
  })
  performance!: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
    lastNTasks: Array<{
      taskId: string;
      projectId: string;
      status: 'success' | 'failure';
      duration: number;
      timestamp: Date;
    }>;
    projectMetrics: Record<
      string,
      {
        tasksCompleted: number;
        successRate: number;
        averageResponseTime: number;
      }
    >;
    metrics: Record<string, number>;
  };

  @Column({
    type: 'jsonb',
    nullable: false,
    default: [],
  })
  currentTasks!: Array<{
    id: string;
    projectId: string;
    type: string;
    status: 'running' | 'paused' | 'blocked';
    progress: number;
    startedAt: Date;
    estimatedCompletion?: Date;
    dependencies?: string[];
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper methods
  updateStatus(newStatus: AgentStatus): void {
    this.status = newStatus;
  }

  updateCapabilities(capabilities: Partial<NonNullable<Agent['capabilities']>>): void {
    this.capabilities = {
      skills: capabilities.skills || this.capabilities.skills,
      languages: capabilities.languages || this.capabilities.languages,
      tools: capabilities.tools || this.capabilities.tools,
      apis: capabilities.apis || this.capabilities.apis,
      permissions: capabilities.permissions || this.capabilities.permissions,
      concurrency: capabilities.concurrency || this.capabilities.concurrency,
    };
  }

  updateSettings(settings: Partial<NonNullable<Agent['settings']>>): void {
    this.settings = {
      maxConcurrentTasks: settings.maxConcurrentTasks || this.settings.maxConcurrentTasks,
      timeout: settings.timeout || this.settings.timeout,
      retryAttempts: settings.retryAttempts || this.settings.retryAttempts,
      priority: settings.priority || this.settings.priority,
      notificationPreferences:
        settings.notificationPreferences || this.settings.notificationPreferences,
      projectSpecificSettings:
        settings.projectSpecificSettings || this.settings.projectSpecificSettings,
      customSettings: settings.customSettings || this.settings.customSettings,
    };
  }

  updateProjectSettings(projectId: string, settings: Record<string, unknown>): void {
    if (!this.settings.projectSpecificSettings) {
      this.settings.projectSpecificSettings = {};
    }

    this.settings.projectSpecificSettings[projectId] = {
      priority: 1,
      customSettings: settings,
    };
  }

  recordTaskCompletion(
    taskId: string,
    projectId: string,
    success: boolean,
    duration: number,
  ): void {
    this.performance.tasksCompleted++;
    const totalSuccess =
      this.performance.successRate * (this.performance.tasksCompleted - 1) + (success ? 1 : 0);
    this.performance.successRate = totalSuccess / this.performance.tasksCompleted;
    this.performance.averageResponseTime =
      (this.performance.averageResponseTime * (this.performance.tasksCompleted - 1) + duration) /
      this.performance.tasksCompleted;

    this.performance.lastNTasks.push({
      taskId,
      projectId,
      status: success ? 'success' : 'failure',
      duration,
      timestamp: new Date(),
    });

    if (this.performance.lastNTasks.length > 10) {
      this.performance.lastNTasks.shift();
    }

    if (!this.performance.projectMetrics[projectId]) {
      this.performance.projectMetrics[projectId] = {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
      };
    }

    const projectMetrics = this.performance.projectMetrics[projectId];
    projectMetrics.tasksCompleted++;
    const projectTotalSuccess =
      projectMetrics.successRate * (projectMetrics.tasksCompleted - 1) + (success ? 1 : 0);
    projectMetrics.successRate = projectTotalSuccess / projectMetrics.tasksCompleted;
    projectMetrics.averageResponseTime =
      (projectMetrics.averageResponseTime * (projectMetrics.tasksCompleted - 1) + duration) /
      projectMetrics.tasksCompleted;
  }

  startTask(taskId: string, projectId: string, type: string, dependencies?: string[]): void {
    this.currentTasks.push({
      id: taskId,
      projectId,
      type,
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      dependencies,
    });
  }

  updateTaskProgress(taskId: string, progress: number): void {
    const task = this.currentTasks.find(t => t.id === taskId);
    if (task) {
      task.progress = progress;
    }
  }

  completeTask(taskId: string): void {
    this.currentTasks = this.currentTasks.filter(t => t.id !== taskId);
  }

  pauseTask(taskId: string): void {
    const task = this.currentTasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'paused';
    }
  }

  resumeTask(taskId: string): void {
    const task = this.currentTasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'running';
    }
  }

  addProject(project: Project): void {
    this.projects.push(project);
  }

  removeProject(projectId: string): void {
    this.projects = this.projects.filter(p => p.id !== projectId);
  }
}
