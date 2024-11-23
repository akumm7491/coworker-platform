import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { AggregateRoot } from '@coworker/shared/database/base/AggregateRoot';
import { TeamStatus } from '@coworker/shared/types/agent';
import { Agent } from './agent.entity';
import { Project } from './project.entity';
import { DomainEvent } from '@coworker/shared/events/definitions/DomainEvent';
import {
  TeamEventTypes,
  isTeamStatusEventData,
  isTeamMemberEventData,
  isTeamCapabilitiesEventData,
  isTeamMetadataEventData,
  isTeamDescriptionEventData,
} from '../events/team.events';

@Entity('teams')
export class Team extends AggregateRoot {
  @Column()
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TeamStatus,
    default: TeamStatus.ACTIVE,
  })
  status!: TeamStatus;

  @OneToMany(() => Agent, agent => agent.team)
  agents!: Agent[];

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column('jsonb', { default: {} })
  capabilities!: {
    [key: string]: number;
  };

  @ManyToOne(() => Project, project => project.teams)
  project!: Project;

  // Domain-specific methods
  setStatus(newStatus: TeamStatus): void {
    if (this.status !== newStatus) {
      const eventData = {
        status: newStatus,
      };

      this.addDomainEvent({
        eventType: TeamEventTypes.STATUS_UPDATED,
        data: eventData,
        occurredOn: new Date(),
        aggregateId: this.id.toString(),
        version: this.version,
        toJSON: function (): Record<string, unknown> {
          return {
            eventType: TeamEventTypes.STATUS_UPDATED,
            data: eventData,
            occurredOn: new Date(),
            aggregateId: this.aggregateId,
            version: this.version,
          };
        },
      });
      this.status = newStatus;
    }
  }

  applyEvent(event: DomainEvent): void {
    const { eventType, data } = event;

    switch (eventType) {
      case TeamEventTypes.STATUS_UPDATED:
        if (isTeamStatusEventData(data)) {
          this.status = data.status;
        }
        break;

      case TeamEventTypes.MEMBER_ADDED:
      case TeamEventTypes.MEMBER_REMOVED:
        if (isTeamMemberEventData(data)) {
          // Note: The actual agent entities need to be loaded separately
          // This just updates the IDs
          this.agents = [{ id: data.agentId } as Agent];
        }
        break;

      case TeamEventTypes.CAPABILITIES_UPDATED:
        if (isTeamCapabilitiesEventData(data)) {
          this.capabilities = data.capabilities;
        }
        break;

      case TeamEventTypes.METADATA_UPDATED:
        if (isTeamMetadataEventData(data)) {
          this.metadata = data.metadata;
        }
        break;

      case TeamEventTypes.DESCRIPTION_UPDATED:
        if (isTeamDescriptionEventData(data)) {
          this.description = data.description;
        }
        break;

      default:
        throw new Error(`Unhandled event type: ${eventType}`);
    }
  }
}
