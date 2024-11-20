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
  ASSISTANT = 'assistant',
  GENERAL = 'general',
  SPECIALIZED = 'specialized',
  CUSTOM = 'custom',
}

export enum AgentScope {
  PROJECT = 'project',
  ORGANIZATION = 'organization',
}

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.IDLE,
  })
  status: AgentStatus;

  @Column({
    type: 'enum',
    enum: AgentType,
    default: AgentType.ASSISTANT,
  })
  type: AgentType;

  @Column({
    type: 'enum',
    enum: AgentScope,
    default: AgentScope.PROJECT,
  })
  scope: AgentScope;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, user => user.agents)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToMany(() => Project, project => project.agents)
  @JoinTable({
    name: 'agent_projects',
    joinColumn: { name: 'agentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'projectId', referencedColumnName: 'id' },
  })
  projects: Project[];

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
  capabilities: {
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
  settings: {
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
  performance: {
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
  currentTasks: Array<{
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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  updateStatus(newStatus: AgentStatus): void {
    this.status = newStatus;
  }

  updateCapabilities(capabilities: Partial<NonNullable<Agent['capabilities']>>): void {
    this.capabilities = { ...this.capabilities, ...capabilities };
  }

  updateSettings(settings: Partial<NonNullable<Agent['settings']>>): void {
    this.settings = { ...this.settings, ...settings };
  }

  updateProjectSettings(projectId: string, settings: Record<string, unknown>): void {
    if (!this.settings.projectSpecificSettings) {
      this.settings.projectSpecificSettings = {};
    }
    this.settings.projectSpecificSettings[projectId] = {
      ...this.settings.projectSpecificSettings[projectId],
      ...settings,
    };
  }

  recordTaskCompletion(
    taskId: string,
    projectId: string,
    success: boolean,
    duration: number,
  ): void {
    // Update lastNTasks
    this.performance.lastNTasks.push({
      taskId,
      projectId,
      status: success ? 'success' : 'failure',
      duration,
      timestamp: new Date(),
    });

    // Keep only last 100 tasks
    if (this.performance.lastNTasks.length > 100) {
      this.performance.lastNTasks = this.performance.lastNTasks.slice(-100);
    }

    // Update overall metrics
    this.performance.tasksCompleted += 1;
    const totalTasks = this.performance.lastNTasks.length;
    const successfulTasks = this.performance.lastNTasks.filter(
      task => task.status === 'success',
    ).length;
    this.performance.successRate = (successfulTasks / totalTasks) * 100;
    this.performance.averageResponseTime =
      (this.performance.averageResponseTime * (totalTasks - 1) + duration) / totalTasks;

    // Update project-specific metrics
    if (!this.performance.projectMetrics[projectId]) {
      this.performance.projectMetrics[projectId] = {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
      };
    }
    const projectMetrics = this.performance.projectMetrics[projectId];
    projectMetrics.tasksCompleted += 1;
    const projectTasks = this.performance.lastNTasks.filter(
      task => task.projectId === projectId,
    );
    const projectSuccessfulTasks = projectTasks.filter(
      task => task.status === 'success',
    ).length;
    projectMetrics.successRate = (projectSuccessfulTasks / projectTasks.length) * 100;
    projectMetrics.averageResponseTime =
      (projectMetrics.averageResponseTime * (projectTasks.length - 1) + duration) /
      projectTasks.length;
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
    this.currentTasks = this.currentTasks.filter(task => task.id !== taskId);
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
    if (!this.projects) {
      this.projects = [];
    }
    if (!this.projects.find(p => p.id === project.id)) {
      this.projects.push(project);
    }
  }

  removeProject(projectId: string): void {
    if (this.projects) {
      this.projects = this.projects.filter(project => project.id !== projectId);
    }
  }
}
