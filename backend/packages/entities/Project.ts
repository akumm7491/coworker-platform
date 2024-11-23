import { AggregateRoot } from '../src/domain/base/AggregateRoot';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import {
  ProjectStatus,
  ProjectVision,
  ProjectIntegration,
  ProjectDesignSystem,
  ProjectFeature,
  ProjectAnalytics,
  Agent,
  Team,
  Task,
} from '../types/project.types';
import {
  ProjectCreatedEvent,
  ProjectStatusUpdatedEvent,
  ProjectVisionUpdatedEvent,
  ProjectTeamAssignedEvent,
  ProjectAgentAssignedEvent,
  ProjectLeadAgentSetEvent,
  ProjectTaskAddedEvent,
  ProjectTaskCompletedEvent,
} from '../events/project.events';
import { Result } from '../src/common/Result';
import { ValidationError } from '../src/domain/errors/DomainError';

@Entity()
export class Project extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  private _name: string;

  @Column()
  private _description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  private _status: ProjectStatus;

  @Column('jsonb')
  private _vision: ProjectVision;

  @Column('jsonb', { nullable: true })
  private _requirements: string[];

  @OneToMany(() => Task, task => task.project)
  private _tasks: Task[];

  @ManyToOne(() => Agent, { nullable: true })
  private _leadAgent?: Agent;

  @ManyToOne(() => Team, { nullable: true })
  private _teams?: Team[];

  @Column('jsonb', { nullable: true })
  private _integrations: Map<string, ProjectIntegration>;

  @Column('jsonb', { nullable: true })
  private _designSystem: ProjectDesignSystem;

  @Column('jsonb', { nullable: true })
  private _features: Map<string, ProjectFeature>;

  @Column('jsonb', { nullable: true })
  private _analytics: ProjectAnalytics;

  @Column('date', { nullable: true })
  private _startDate?: Date;

  @Column('date', { nullable: true })
  private _completionDate?: Date;

  @Column('date', { nullable: true })
  private _deadline?: Date;

  private constructor(id: string, name: string, description: string, vision: ProjectVision) {
    super(id);
    this._name = name;
    this._description = description;
    this._status = ProjectStatus.PLANNING;
    this._vision = vision;
    this._requirements = [];
    this._tasks = [];
    this._integrations = new Map();
    this._features = new Map();
    this._analytics = {
      agent_performance: {},
      task_completion: {},
      timeline: [],
      metrics: {},
    };
  }

  public static create(
    id: string,
    name: string,
    description: string,
    vision: ProjectVision
  ): Result<Project> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new ValidationError('Project name is required'));
    }
    if (!description || description.trim().length === 0) {
      return Result.fail(new ValidationError('Project description is required'));
    }
    if (!vision || !vision.goals || vision.goals.length === 0) {
      return Result.fail(new ValidationError('Project vision with goals is required'));
    }

    const project = new Project(id, name, description, vision);
    project.addDomainEvent(new ProjectCreatedEvent(id, name, description, vision));
    return Result.ok(project);
  }

  // Status Management
  public updateStatus(newStatus: ProjectStatus): Result<void> {
    const oldStatus = this._status;
    this._status = newStatus;
    this.addDomainEvent(new ProjectStatusUpdatedEvent(this.id, oldStatus, newStatus));
    return Result.ok(void 0);
  }

  // Vision Management
  public updateVision(vision: ProjectVision): Result<void> {
    if (!vision || !vision.goals || vision.goals.length === 0) {
      return Result.fail(new ValidationError('Invalid project vision'));
    }
    this._vision = vision;
    this.addDomainEvent(new ProjectVisionUpdatedEvent(this.id, vision));
    return Result.ok(void 0);
  }

  // Team Management
  public assignTeam(team: Team): Result<void> {
    if (!this._teams) {
      this._teams = [];
    }
    if (!this._teams.find(t => t.id === team.id)) {
      this._teams.push(team);
      this.addDomainEvent(new ProjectTeamAssignedEvent(this.id, team.id));
    }
    return Result.ok(void 0);
  }

  public unassignTeam(teamId: string): Result<void> {
    if (this._teams) {
      this._teams = this._teams.filter(t => t.id !== teamId);
    }
    return Result.ok(void 0);
  }

  // Agent Management
  public assignAgent(agent: Agent): Result<void> {
    if (!this._leadAgent) {
      this._leadAgent = agent;
      this.addDomainEvent(new ProjectAgentAssignedEvent(this.id, agent.id));
    }
    return Result.ok(void 0);
  }

  public unassignAgent(agentId: string): Result<void> {
    if (this._leadAgent && this._leadAgent.id === agentId) {
      this._leadAgent = undefined;
    }
    return Result.ok(void 0);
  }

  public setLeadAgent(agent: Agent): Result<void> {
    this._leadAgent = agent;
    this.addDomainEvent(new ProjectLeadAgentSetEvent(this.id, agent.id));
    return Result.ok(void 0);
  }

  // Task Management
  public addTask(task: Task): Result<void> {
    if (!this._tasks) {
      this._tasks = [];
    }
    this._tasks.push(task);
    this.addDomainEvent(new ProjectTaskAddedEvent(this.id, task));
    return Result.ok(void 0);
  }

  public completeTask(taskId: string): Result<void> {
    if (this._tasks) {
      const task = this._tasks.find(t => t.id === taskId);
      if (task) {
        task.status = 'completed';
        this.addDomainEvent(new ProjectTaskCompletedEvent(this.id, taskId));
      } else {
        return Result.fail(new ValidationError('Task not found'));
      }
    }
    return Result.ok(void 0);
  }

  // Integration Management
  public addIntegration(key: string, integration: ProjectIntegration): Result<void> {
    if (!this._integrations) {
      this._integrations = new Map();
    }
    this._integrations.set(key, integration);
    return Result.ok(void 0);
  }

  public removeIntegration(key: string): Result<void> {
    if (this._integrations) {
      this._integrations.delete(key);
    }
    return Result.ok(void 0);
  }

  // Feature Management
  public addFeature(key: string, feature: ProjectFeature): Result<void> {
    if (!this._features) {
      this._features = new Map();
    }
    this._features.set(key, feature);
    return Result.ok(void 0);
  }

  public removeFeature(key: string): Result<void> {
    if (this._features) {
      this._features.delete(key);
    }
    return Result.ok(void 0);
  }

  // Timeline Management
  public updateStartDate(date: Date): Result<void> {
    this._startDate = date;
    return Result.ok(void 0);
  }

  public updateCompletionDate(date: Date): Result<void> {
    this._completionDate = date;
    return Result.ok(void 0);
  }

  public updateDeadline(date: Date): Result<void> {
    this._deadline = date;
    return Result.ok(void 0);
  }

  // Analytics Management
  public updateAnalytics(analytics: ProjectAnalytics): Result<void> {
    this._analytics = analytics;
    return Result.ok(void 0);
  }

  // Getters
  public get name(): string {
    return this._name;
  }
  public get description(): string {
    return this._description;
  }
  public get status(): ProjectStatus {
    return this._status;
  }
  public get vision(): ProjectVision {
    return this._vision;
  }
  public get requirements(): string[] {
    return [...this._requirements];
  }
  public get tasks(): Task[] {
    return [...this._tasks];
  }
  public get agents(): Agent[] {
    return [this._leadAgent];
  }
  public get teams(): Team[] {
    return [...this._teams];
  }
  public get integrations(): Map<string, ProjectIntegration> {
    return new Map(this._integrations);
  }
  public get designSystem(): ProjectDesignSystem {
    return this._designSystem;
  }
  public get features(): Map<string, ProjectFeature> {
    return new Map(this._features);
  }
  public get analytics(): ProjectAnalytics {
    return { ...this._analytics };
  }
  public get leadAgent(): Agent | undefined {
    return this._leadAgent;
  }
  public get startDate(): Date | undefined {
    return this._startDate;
  }
  public get completionDate(): Date | undefined {
    return this._completionDate;
  }
  public get deadline(): Date | undefined {
    return this._deadline;
  }
}
