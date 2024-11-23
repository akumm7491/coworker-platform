import { DomainEvent } from '../DomainEvent';
import {
  AgentStatus,
  AgentRole,
  AgentSkill,
  AgentSpecialization,
  AgentPerformanceMetrics,
} from '../../types/agent.types';

export class AgentCreatedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly name: string,
    public readonly status: AgentStatus,
    public readonly roles: AgentRole[],
    public readonly skills: AgentSkill[],
    public readonly specializations: AgentSpecialization[]
  ) {
    super();
  }
}

export class AgentStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly previousStatus: AgentStatus,
    public readonly newStatus: AgentStatus,
    public readonly changedAt: Date
  ) {
    super();
  }
}

export class AgentRoleAddedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly role: AgentRole,
    public readonly addedAt: Date
  ) {
    super();
  }
}

export class AgentRoleRemovedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly role: AgentRole,
    public readonly removedAt: Date
  ) {
    super();
  }
}

export class AgentPerformanceUpdatedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly metrics: AgentPerformanceMetrics,
    public readonly updatedAt: Date
  ) {
    super();
  }
}

export class AgentLearningModelUpdatedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly model: {
      model_version: string;
      last_updated: Date;
      training_status: string;
    },
    public readonly updatedAt: Date
  ) {
    super();
  }
}

export class AgentWorkingMemoryUpdatedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly memory: {
      context_size: number;
      last_accessed: Date;
      memory_usage: number;
    },
    public readonly updatedAt: Date
  ) {
    super();
  }
}

export class AgentCommunicationStatsUpdatedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly stats: {
      messages_sent: number;
      messages_received: number;
      avg_response_time: number;
      collaboration_score: number;
    },
    public readonly updatedAt: Date
  ) {
    super();
  }
}

export class AgentSkillAddedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly skill: AgentSkill,
    public readonly proficiency: number,
    public readonly addedAt: Date
  ) {
    super();
  }
}

export class AgentSkillRemovedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly skill: AgentSkill,
    public readonly removedAt: Date
  ) {
    super();
  }
}

export class AgentSpecializationAddedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly specialization: AgentSpecialization,
    public readonly addedAt: Date
  ) {
    super();
  }
}

export class AgentSpecializationRemovedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly specialization: AgentSpecialization,
    public readonly removedAt: Date
  ) {
    super();
  }
}

export class AgentAvailabilityUpdatedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly availability: {
      available_hours: { start: Date; end: Date }[];
      time_zone: string;
      next_available_slot: Date;
    },
    public readonly updatedAt: Date
  ) {
    super();
  }
}

export class AgentTaskAssignedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly taskId: string,
    public readonly assignedAt: Date
  ) {
    super();
  }
}

export class AgentTaskUnassignedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly taskId: string,
    public readonly unassignedAt: Date
  ) {
    super();
  }
}

export class AgentTeamJoinedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly teamId: string,
    public readonly joinedAt: Date
  ) {
    super();
  }
}

export class AgentTeamLeftEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly teamId: string,
    public readonly leftAt: Date
  ) {
    super();
  }
}

export class AgentDeletedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly deletedAt: Date,
    public readonly reason?: string
  ) {
    super();
  }
}
