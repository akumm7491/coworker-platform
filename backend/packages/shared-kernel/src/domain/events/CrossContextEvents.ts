import { DomainEvent } from '../events/DomainEvent';

// Events that need to be shared across multiple bounded contexts

export class TaskAssignedToDifferentTeamEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousTeamId: string,
    public readonly newTeamId: string,
    public readonly assignedAt: Date
  ) {
    super('TaskAssignedToDifferentTeam', taskId);
  }
}

export class AgentMovedToNewTeamEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly previousTeamId: string,
    public readonly newTeamId: string,
    public readonly movedAt: Date
  ) {
    super('AgentMovedToNewTeam', agentId);
  }
}

export class TeamCapacityExceededEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly currentCapacity: number,
    public readonly maxCapacity: number,
    public readonly exceededAt: Date
  ) {
    super('TeamCapacityExceeded', teamId);
  }
}

export class ProjectStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly changedAt: Date
  ) {
    super('ProjectStatusChanged', projectId);
  }
}
