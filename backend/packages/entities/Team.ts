import { AggregateRoot } from '../shared-kernel/src/domain/base/AggregateRoot';
import { Result } from '../Result';
import { Agent } from './Agent';
import { TeamStatus } from '../types/team.types';
import {
  TeamCreatedEvent,
  TeamMemberAddedEvent,
  TeamMemberRemovedEvent,
  TeamStatusUpdatedEvent,
  TeamCapabilitiesUpdatedEvent,
  TeamActivatedEvent,
  TeamDeactivatedEvent,
} from '../events/team.events';

export class Team extends AggregateRoot {
  private _name: string;
  private _description: string;
  private _status: TeamStatus;
  private _members: Agent[];
  private _capabilities: Map<string, number>;

  private constructor(id: string, name: string, description: string) {
    super(id);
    this._name = name;
    this._description = description;
    this._status = TeamStatus.ACTIVE;
    this._members = [];
    this._capabilities = new Map();
  }

  public static create(id: string, name: string, description: string): Result<Team> {
    if (!name || name.trim().length === 0) {
      return Result.fail('Team name is required');
    }
    if (!description || description.trim().length === 0) {
      return Result.fail('Team description is required');
    }

    const team = new Team(id, name, description);
    team.addDomainEvent(new TeamCreatedEvent(id, name, description));
    return Result.ok(team);
  }

  // Member Management
  public addMember(agent: Agent): Result<void> {
    if (this._members.some(m => m.id === agent.id)) {
      return Result.fail('Agent is already a member of this team');
    }

    this._members.push(agent);
    this.addDomainEvent(new TeamMemberAddedEvent(this.id, agent));
    this.updateTeamCapabilities();
    return Result.ok();
  }

  public removeMember(agentId: string): Result<void> {
    const memberIndex = this._members.findIndex(m => m.id === agentId);
    if (memberIndex === -1) {
      return Result.fail('Agent is not a member of this team');
    }

    this._members.splice(memberIndex, 1);
    this.addDomainEvent(new TeamMemberRemovedEvent(this.id, agentId));
    this.updateTeamCapabilities();
    return Result.ok();
  }

  // Status Management
  public activate(): Result<void> {
    if (this._status === TeamStatus.ACTIVE) {
      return Result.fail('Team is already active');
    }

    this._status = TeamStatus.ACTIVE;
    this.addDomainEvent(new TeamActivatedEvent(this.id));
    return Result.ok();
  }

  public deactivate(): Result<void> {
    if (this._status === TeamStatus.INACTIVE) {
      return Result.fail('Team is already inactive');
    }

    this._status = TeamStatus.INACTIVE;
    this.addDomainEvent(new TeamDeactivatedEvent(this.id));
    return Result.ok();
  }

  public updateStatus(status: TeamStatus): Result<void> {
    const oldStatus = this._status;
    this._status = status;
    this.addDomainEvent(new TeamStatusUpdatedEvent(this.id, oldStatus, status));
    return Result.ok();
  }

  // Capability Management
  private updateTeamCapabilities(): void {
    const capabilities = new Map<string, number>();

    // Aggregate capabilities from all team members
    this._members.forEach(member => {
      member.capabilities.forEach(capability => {
        const currentLevel = capabilities.get(capability) || 0;
        capabilities.set(capability, currentLevel + 1);
      });
    });

    this._capabilities = capabilities;
    this.addDomainEvent(
      new TeamCapabilitiesUpdatedEvent(this.id, Object.fromEntries(capabilities))
    );
  }

  // Getters
  public get name(): string {
    return this._name;
  }
  public get description(): string {
    return this._description;
  }
  public get status(): TeamStatus {
    return this._status;
  }
  public get members(): Agent[] {
    return [...this._members];
  }
  public get capabilities(): Map<string, number> {
    return new Map(this._capabilities);
  }
}
