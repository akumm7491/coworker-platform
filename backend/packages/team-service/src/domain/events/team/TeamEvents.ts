import { DomainEvent } from '../DomainEvent';
import { TeamStatus, TeamCapability } from '../../types/team.types';

export class TeamCreatedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly leaderId: string,
    public readonly status: TeamStatus,
    public readonly capabilities: TeamCapability[],
  ) {
    super();
  }
}

export class TeamMemberAddedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly memberId: string,
    public readonly addedAt: Date,
    public readonly role?: string,
  ) {
    super();
  }
}

export class TeamMemberRemovedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly memberId: string,
    public readonly removedAt: Date,
    public readonly reason?: string,
  ) {
    super();
  }
}

export class TeamLeaderChangedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly previousLeaderId: string,
    public readonly newLeaderId: string,
    public readonly changedAt: Date,
  ) {
    super();
  }
}

export class TeamStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly previousStatus: TeamStatus,
    public readonly newStatus: TeamStatus,
    public readonly changedAt: Date,
  ) {
    super();
  }
}

export class TeamCapabilityAddedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly capability: TeamCapability,
    public readonly addedAt: Date,
  ) {
    super();
  }
}

export class TeamCapabilityRemovedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly capability: TeamCapability,
    public readonly removedAt: Date,
  ) {
    super();
  }
}

export class TeamPerformanceUpdatedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly metrics: {
      task_completion_rate: number;
      avg_task_completion_time: number;
      code_quality_score: number;
      collaboration_score: number;
      productivity_score: number;
    },
    public readonly updatedAt: Date,
  ) {
    super();
  }
}

export class TeamWorkloadUpdatedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly workload: {
      current_tasks: number;
      completed_tasks: number;
      pending_tasks: number;
      workload_percentage: number;
    },
    public readonly updatedAt: Date,
  ) {
    super();
  }
}

export class TeamScheduleUpdatedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly schedule: {
      working_hours: { start: Date; end: Date }[];
      time_zone: string;
      availability_percentage: number;
    },
    public readonly updatedAt: Date,
  ) {
    super();
  }
}

export class TeamDeletedEvent extends DomainEvent {
  constructor(
    public readonly teamId: string,
    public readonly deletedAt: Date,
    public readonly reason?: string,
  ) {
    super();
  }
}
