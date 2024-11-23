import { Entity, Column, ManyToMany, ManyToOne, JoinTable, Index } from 'typeorm';
import { AggregateRoot } from '@coworker/shared/database/base/AggregateRoot';
import {
  AgentStatus,
  AgentRole,
  AgentPerformance,
  AgentLearningModel,
  AgentWorkingMemory,
  AgentCommunication,
} from '@coworker/shared/types/agent';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { Team } from './team.entity';
import { DomainEvent } from '@coworker/shared/events/definitions/DomainEvent';
import {
  AgentEventTypes,
  isAgentStatusEventData,
  isAgentRoleEventData,
  isAgentCapabilitiesEventData,
  isAgentPerformanceMetricsEventData,
  isAgentLearningModelEventData,
  isAgentWorkingMemoryEventData,
  isAgentCommunicationEventData,
  isAgentMetadataEventData,
  isAgentDescriptionEventData,
} from '../events/agent.events';

@Entity('agents')
export class Agent extends AggregateRoot {
  @Column()
  @Index()
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.IDLE,
  })
  status!: AgentStatus;

  @Column({
    type: 'enum',
    enum: AgentRole,
  })
  role!: AgentRole;

  @Column('text', { array: true })
  capabilities!: string[];

  @Column('jsonb')
  performance_metrics!: AgentPerformance;

  @Column('jsonb')
  learning_model!: AgentLearningModel;

  @Column('jsonb')
  working_memory!: AgentWorkingMemory;

  @Column('jsonb')
  communication!: AgentCommunication;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToMany(() => Project, project => project.agents)
  @JoinTable()
  projects!: Project[];

  @ManyToMany(() => Task, task => task.assigned_agents)
  @JoinTable()
  tasks!: Task[];

  @ManyToOne(() => Team, team => team.agents)
  team!: Team;

  // Domain-specific methods
  setStatus(newStatus: AgentStatus): void {
    if (this.status !== newStatus) {
      const eventData = {
        status: newStatus,
      };

      this.addDomainEvent({
        eventType: AgentEventTypes.STATUS_UPDATED,
        data: eventData,
        occurredOn: new Date(),
        aggregateId: this.id.toString(),
        version: this.version,
        toJSON: function (): Record<string, unknown> {
          return {
            eventType: AgentEventTypes.STATUS_UPDATED,
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
      case AgentEventTypes.STATUS_UPDATED:
        if (isAgentStatusEventData(data)) {
          this.status = data.status;
        }
        break;

      case AgentEventTypes.ROLE_UPDATED:
        if (isAgentRoleEventData(data)) {
          this.role = data.role;
        }
        break;

      case AgentEventTypes.CAPABILITIES_UPDATED:
        if (isAgentCapabilitiesEventData(data)) {
          this.capabilities = data.capabilities;
        }
        break;

      case AgentEventTypes.PERFORMANCE_METRICS_UPDATED:
        if (isAgentPerformanceMetricsEventData(data)) {
          this.performance_metrics = data.performance_metrics;
        }
        break;

      case AgentEventTypes.LEARNING_MODEL_UPDATED:
        if (isAgentLearningModelEventData(data)) {
          this.learning_model = data.learning_model;
        }
        break;

      case AgentEventTypes.WORKING_MEMORY_UPDATED:
        if (isAgentWorkingMemoryEventData(data)) {
          this.working_memory = data.working_memory;
        }
        break;

      case AgentEventTypes.COMMUNICATION_UPDATED:
        if (isAgentCommunicationEventData(data)) {
          this.communication = data.communication;
        }
        break;

      case AgentEventTypes.METADATA_UPDATED:
        if (isAgentMetadataEventData(data)) {
          this.metadata = data.metadata;
        }
        break;

      case AgentEventTypes.DESCRIPTION_UPDATED:
        if (isAgentDescriptionEventData(data)) {
          this.description = data.description;
        }
        break;

      default:
        throw new Error(`Unhandled event type: ${eventType}`);
    }
  }
}
