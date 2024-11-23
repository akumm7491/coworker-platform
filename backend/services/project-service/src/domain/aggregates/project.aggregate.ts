import { AggregateRoot } from '@nestjs/cqrs';
import { ProjectStatus, ProjectVision, ProjectAnalytics } from '@coworker/shared/types/agent';
import { Task } from '../entities/task.entity';
import { Team } from '../entities/team.entity';
import {
  ProjectCreatedEvent,
  ProjectStatusUpdatedEvent,
  TaskAddedEvent,
  TeamAssignedEvent,
} from '../events/project.events';

export class Project extends AggregateRoot {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public status: ProjectStatus,
    public vision: ProjectVision,
    public tasks: Task[] = [],
    public teamId?: string,
    public analytics?: ProjectAnalytics,
    public metadata: Record<string, unknown> = {}
  ) {
    super();
  }

  // Factory method
  static create(id: string, name: string, description: string, vision: ProjectVision): Project {
    const project = new Project(id, name, description, ProjectStatus.PLANNING, vision);

    project.apply(new ProjectCreatedEvent(project));
    return project;
  }

  // Domain methods
  updateStatus(newStatus: ProjectStatus): void {
    this.status = newStatus;
    this.apply(new ProjectStatusUpdatedEvent(this.id, newStatus));
  }

  addTask(task: Task): void {
    this.tasks.push(task);
    this.apply(new TaskAddedEvent(this.id, task));
  }

  assignTeam(teamId: string): void {
    this.teamId = teamId;
    this.apply(new TeamAssignedEvent(this.id, teamId));
  }

  updateAnalytics(analytics: ProjectAnalytics): void {
    this.analytics = analytics;
  }

  updateMetadata(metadata: Record<string, unknown>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }
}
