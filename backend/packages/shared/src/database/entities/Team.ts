import { Entity, Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { AggregateRoot } from '../base/AggregateRoot';
import { DomainEvent, EventData } from '../../events/definitions/DomainEvent';
import { Agent } from './Agent';

export enum TeamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum TeamEventTypes {
  MEMBER_ADDED = 'TeamMemberAdded',
  MEMBER_REMOVED = 'TeamMemberRemoved',
  CAPABILITIES_UPDATED = 'TeamCapabilitiesUpdated',
  STATUS_UPDATED = 'TeamStatusUpdated',
  ACTIVATED = 'TeamActivated',
  DEACTIVATED = 'TeamDeactivated'
}

// Event Data Interfaces
export interface TeamMemberAddedEventData extends EventData {
  teamId: string;
  agentId: string;
  member: Agent;
}

export interface TeamMemberRemovedEventData extends EventData {
  teamId: string;
  agentId: string;
}

export interface TeamCapabilitiesUpdatedEventData extends EventData {
  teamId: string;
  capabilities: {
    [key: string]: number;
  };
}

export interface TeamStatusUpdatedEventData extends EventData {
  teamId: string;
  status: TeamStatus;
}

export interface TeamActivatedEventData extends EventData {
  teamId: string;
}

export interface TeamDeactivatedEventData extends EventData {
  teamId: string;
}

// Type alias for all possible team event data types
export type TeamEventData = 
  | TeamMemberAddedEventData 
  | TeamMemberRemovedEventData 
  | TeamCapabilitiesUpdatedEventData 
  | TeamStatusUpdatedEventData 
  | TeamActivatedEventData 
  | TeamDeactivatedEventData;

// Type Guards
export function isTeamMemberAddedEventData(data: unknown): data is TeamMemberAddedEventData {
  const d = data as TeamMemberAddedEventData;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.teamId === 'string' &&
    typeof d.agentId === 'string' &&
    typeof d.member === 'object' &&
    d.member !== null
  );
}

export function isTeamMemberRemovedEventData(data: unknown): data is TeamMemberRemovedEventData {
  const d = data as TeamMemberRemovedEventData;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.teamId === 'string' &&
    typeof d.agentId === 'string'
  );
}

export function isTeamCapabilitiesUpdatedEventData(data: unknown): data is TeamCapabilitiesUpdatedEventData {
  const d = data as TeamCapabilitiesUpdatedEventData;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.teamId === 'string' &&
    typeof d.capabilities === 'object' &&
    d.capabilities !== null &&
    Object.entries(d.capabilities).every(([key, value]) => 
      typeof key === 'string' && typeof value === 'number'
    )
  );
}

export function isTeamStatusUpdatedEventData(data: unknown): data is TeamStatusUpdatedEventData {
  const d = data as TeamStatusUpdatedEventData;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.teamId === 'string' &&
    typeof d.status === 'string' &&
    Object.values(TeamStatus).includes(d.status as TeamStatus)
  );
}

export function isTeamActivatedEventData(data: unknown): data is TeamActivatedEventData {
  const d = data as TeamActivatedEventData;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.teamId === 'string'
  );
}

export function isTeamDeactivatedEventData(data: unknown): data is TeamDeactivatedEventData {
  const d = data as TeamDeactivatedEventData;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.teamId === 'string'
  );
}

@Entity('teams')
export class Team extends AggregateRoot {
  @Column()
  @Index()
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: TeamStatus,
    default: TeamStatus.ACTIVE
  })
  status!: TeamStatus;

  @ManyToMany(() => Agent)
  @JoinTable({
    name: 'team_members',
    joinColumn: { name: 'team_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'agent_id', referencedColumnName: 'id' }
  })
  members!: Agent[];

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column('jsonb', { default: {} })
  capabilities!: {
    [key: string]: number; // capability name -> proficiency level
  };

  addMember(agent: Agent): void {
    if (!this.members) {
      this.members = [];
    }

    if (!this.members.find(m => m.id === agent.id)) {
      this.members.push(agent);
      this.updateTeamCapabilities();
      
      const eventData: TeamMemberAddedEventData = {
        teamId: this.id,
        agentId: agent.id,
        member: agent
      };
      this.addDomainEvent(this.toDomainEvent(TeamEventTypes.MEMBER_ADDED, eventData));
    }
  }

  removeMember(agentId: string): void {
    if (!this.members) {
      return;
    }

    const initialSize = this.members.length;
    this.members = this.members.filter(m => m.id !== agentId);
    
    if (this.members.length !== initialSize) {
      this.updateTeamCapabilities();
      
      const eventData: TeamMemberRemovedEventData = {
        teamId: this.id,
        agentId
      };
      this.addDomainEvent(this.toDomainEvent(TeamEventTypes.MEMBER_REMOVED, eventData));
    }
  }

  activate(): void {
    if (this.status === TeamStatus.ACTIVE) {
      return;
    }

    this.status = TeamStatus.ACTIVE;
    
    const eventData: TeamActivatedEventData = {
      teamId: this.id
    };
    this.addDomainEvent(this.toDomainEvent(TeamEventTypes.ACTIVATED, eventData));
  }

  deactivate(): void {
    if (this.status === TeamStatus.INACTIVE) {
      return;
    }

    this.status = TeamStatus.INACTIVE;
    
    const eventData: TeamDeactivatedEventData = {
      teamId: this.id
    };
    this.addDomainEvent(this.toDomainEvent(TeamEventTypes.DEACTIVATED, eventData));
  }

  updateStatus(status: TeamStatus): void {
    if (this.status === status) {
      return;
    }

    this.status = status;
    
    const eventData: TeamStatusUpdatedEventData = {
      teamId: this.id,
      status
    };
    this.addDomainEvent(this.toDomainEvent(TeamEventTypes.STATUS_UPDATED, eventData));
  }

  private updateTeamCapabilities(): void {
    const capabilities: { [key: string]: number } = {};

    this.members?.forEach(agent => {
      agent.capabilities.forEach(capability => {
        if (!capabilities[capability]) {
          capabilities[capability] = 1;
        } else {
          capabilities[capability]++;
        }
      });
    });

    this.capabilities = capabilities;
    
    const eventData: TeamCapabilitiesUpdatedEventData = {
      teamId: this.id,
      capabilities: this.capabilities
    };
    this.addDomainEvent(this.toDomainEvent(TeamEventTypes.CAPABILITIES_UPDATED, eventData));
  }

  applyEvent(event: DomainEvent): void {
    switch (event.eventType as TeamEventTypes) {
      case TeamEventTypes.MEMBER_ADDED:
        if (isTeamMemberAddedEventData(event.data)) {
          if (!this.members.some(member => member.id === event.data.agentId)) {
            this.members.push(event.data.member);
          }
        }
        break;
      case TeamEventTypes.MEMBER_REMOVED:
        if (isTeamMemberRemovedEventData(event.data)) {
          this.members = this.members.filter(
            member => member.id !== event.data.agentId
          );
        }
        break;
      case TeamEventTypes.CAPABILITIES_UPDATED:
        if (isTeamCapabilitiesUpdatedEventData(event.data)) {
          this.capabilities = event.data.capabilities;
        }
        break;
      case TeamEventTypes.STATUS_UPDATED:
        if (isTeamStatusUpdatedEventData(event.data)) {
          this.status = event.data.status;
        }
        break;
      case TeamEventTypes.ACTIVATED:
        if (isTeamActivatedEventData(event.data)) {
          this.status = TeamStatus.ACTIVE;
        }
        break;
      case TeamEventTypes.DEACTIVATED:
        if (isTeamDeactivatedEventData(event.data)) {
          this.status = TeamStatus.INACTIVE;
        }
        break;
    }
  }

  protected toDomainEvent(eventType: TeamEventTypes, data: TeamEventData): DomainEvent {
    return new TeamEvent(eventType, this.id, this.version, data);
  }
}

export class TeamEvent extends DomainEvent {
  constructor(
    eventType: TeamEventTypes,
    aggregateId: string,
    version: number,
    data: TeamEventData
  ) {
    super(eventType, aggregateId, version, data);
  }

  toJSON(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      version: this.version,
      data: this.data,
      occurredOn: this.occurredOn
    };
  }
}
