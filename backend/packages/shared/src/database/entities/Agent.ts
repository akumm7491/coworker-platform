import { Entity, Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { AggregateRoot } from '../base/AggregateRoot';
import { AgentStatus, AgentRole } from '../../types/agent';
import { DomainEvent, EventData, EventType } from '../../events/definitions/DomainEvent';
import { Project } from './Project';
import { Task } from './Task';
import { Team } from './Team';

// Event Data Interfaces
export interface AgentStatusEventData extends EventData {
    status: AgentStatus;
}

export interface AgentRoleEventData extends EventData {
    role: AgentRole;
}

export interface AgentCapabilitiesEventData extends EventData {
    capabilities: string[];
}

export interface AgentPerformanceEventData extends EventData {
    performance_metrics: {
        tasks_completed: number;
        avg_completion_time: number;
        success_rate: number;
        quality_score: number;
        collaboration_score: number;
    };
}

export interface AgentLearningModelEventData extends EventData {
    learning_model: {
        model_type: string;
        parameters: Record<string, unknown>;
        training_data: Array<{
            input: unknown;
            output: unknown;
            feedback: unknown;
        }>;
        version: string;
    };
}

export interface AgentWorkingMemoryEventData extends EventData {
    working_memory: {
        context: Record<string, unknown>;
        short_term: Array<{
            timestamp: string;
            type: string;
            data: unknown;
        }>;
        long_term: Array<{
            category: string;
            knowledge: unknown;
            last_accessed: string;
        }>;
    };
}

export interface AgentCommunicationEventData extends EventData {
    communication: {
        style: string;
        preferences: Record<string, string>;
        history: Array<{
            timestamp: string;
            type: string;
            content: string;
            metadata: Record<string, unknown>;
        }>;
    };
}

export interface AgentAssignmentEventData extends EventData {
    entityId: string;
    entityType: 'project' | 'task';
}

export interface AgentTeamEventData extends EventData {
    teamId: string;
}

// Type alias for all possible agent event data types
export type AgentEventData = 
    | AgentStatusEventData
    | AgentRoleEventData
    | AgentCapabilitiesEventData
    | AgentPerformanceEventData
    | AgentLearningModelEventData
    | AgentWorkingMemoryEventData
    | AgentCommunicationEventData
    | AgentAssignmentEventData
    | AgentTeamEventData;

// Type Guards
export function isAgentStatusEventData(data: unknown): data is AgentStatusEventData {
    const d = data as AgentStatusEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.status === 'string' && 
           Object.values(AgentStatus).includes(d.status as AgentStatus);
}

export function isAgentRoleEventData(data: unknown): data is AgentRoleEventData {
    const d = data as AgentRoleEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.role === 'string' && 
           Object.values(AgentRole).includes(d.role as AgentRole);
}

export function isAgentCapabilitiesEventData(data: unknown): data is AgentCapabilitiesEventData {
    const d = data as AgentCapabilitiesEventData;
    return typeof d === 'object' &&
           d !== null &&
           Array.isArray(d.capabilities) && 
           d.capabilities.every(cap => typeof cap === 'string');
}

export function isAgentPerformanceEventData(data: unknown): data is AgentPerformanceEventData {
    const d = data as AgentPerformanceEventData;
    if (!d || typeof d !== 'object' || !d.performance_metrics || typeof d.performance_metrics !== 'object') return false;
    const metrics = d.performance_metrics;
    return typeof metrics.tasks_completed === 'number' &&
           typeof metrics.avg_completion_time === 'number' &&
           typeof metrics.success_rate === 'number' &&
           typeof metrics.quality_score === 'number' &&
           typeof metrics.collaboration_score === 'number';
}

export function isAgentLearningModelEventData(data: unknown): data is AgentLearningModelEventData {
    const d = data as AgentLearningModelEventData;
    if (!d || typeof d !== 'object' || !d.learning_model || typeof d.learning_model !== 'object') return false;
    const model = d.learning_model;
    return typeof model.model_type === 'string' &&
           typeof model.parameters === 'object' && model.parameters !== null &&
           Array.isArray(model.training_data) && model.training_data.every(td => typeof td === 'object' && td !== null) &&
           typeof model.version === 'string';
}

export function isAgentWorkingMemoryEventData(data: unknown): data is AgentWorkingMemoryEventData {
    const d = data as AgentWorkingMemoryEventData;
    if (!d || typeof d !== 'object' || !d.working_memory || typeof d.working_memory !== 'object') return false;
    const memory = d.working_memory;
    return typeof memory.context === 'object' && memory.context !== null &&
           Array.isArray(memory.short_term) && memory.short_term.every(st => typeof st === 'object' && st !== null) &&
           Array.isArray(memory.long_term) && memory.long_term.every(lt => typeof lt === 'object' && lt !== null);
}

export function isAgentCommunicationEventData(data: unknown): data is AgentCommunicationEventData {
    const d = data as AgentCommunicationEventData;
    if (!d || typeof d !== 'object' || !d.communication || typeof d.communication !== 'object') return false;
    const comm = d.communication;
    return typeof comm.style === 'string' &&
           typeof comm.preferences === 'object' && comm.preferences !== null &&
           Array.isArray(comm.history) && comm.history.every(h => typeof h === 'object' && h !== null);
}

export function isAgentAssignmentEventData(data: unknown): data is AgentAssignmentEventData {
    const d = data as AgentAssignmentEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.entityId === 'string' &&
           (d.entityType === 'project' || d.entityType === 'task');
}

export function isAgentTeamEventData(data: unknown): data is AgentTeamEventData {
    const d = data as AgentTeamEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.teamId === 'string';
}

// Local Agent Event Types
export type AgentEventType = EventType & string;

export enum AgentEventTypes {
    STATUS_UPDATED = 'AgentStatusUpdated',
    ROLE_UPDATED = 'AgentRoleUpdated',
    CAPABILITIES_UPDATED = 'AgentCapabilitiesUpdated',
    PERFORMANCE_UPDATED = 'AgentPerformanceUpdated',
    LEARNING_MODEL_UPDATED = 'AgentLearningModelUpdated',
    WORKING_MEMORY_UPDATED = 'AgentWorkingMemoryUpdated',
    COMMUNICATION_UPDATED = 'AgentCommunicationUpdated',
    ASSIGNED_TO_PROJECT = 'AgentAssignedToProject',
    REMOVED_FROM_PROJECT = 'AgentRemovedFromProject',
    ASSIGNED_TO_TASK = 'AgentAssignedToTask',
    REMOVED_FROM_TASK = 'AgentRemovedFromTask',
    JOINED_TEAM = 'AgentJoinedTeam',
    LEFT_TEAM = 'AgentLeftTeam'
}

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
        default: AgentStatus.IDLE
    })
    status!: AgentStatus;

    @Column({
        type: 'enum',
        enum: AgentRole,
        default: AgentRole.WORKER
    })
    role!: AgentRole;

    @Column('text', { array: true, default: [] })
    capabilities!: string[];

    @Column('jsonb', { default: {} })
    performance_metrics!: {
        tasks_completed: number;
        avg_completion_time: number;
        success_rate: number;
        quality_score: number;
        collaboration_score: number;
    };

    @Column('jsonb', { default: {} })
    learning_model!: {
        model_type: string;
        parameters: Record<string, unknown>;
        training_data: Array<{
            input: unknown;
            output: unknown;
            feedback: unknown;
        }>;
        version: string;
    };

    @Column('jsonb', { default: {} })
    working_memory!: {
        context: Record<string, unknown>;
        short_term: Array<{
            timestamp: string;
            type: string;
            data: unknown;
        }>;
        long_term: Array<{
            category: string;
            knowledge: unknown;
            last_accessed: string;
        }>;
    };

    @Column('jsonb', { default: {} })
    communication!: {
        style: string;
        preferences: Record<string, string>;
        history: Array<{
            timestamp: string;
            type: string;
            content: string;
            metadata: Record<string, unknown>;
        }>;
    };

    @ManyToMany(() => Project)
    @JoinTable({
        name: 'agent_projects',
        joinColumn: { name: 'agent_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'project_id', referencedColumnName: 'id' }
    })
    projects!: Project[];

    @ManyToMany(() => Task)
    @JoinTable({
        name: 'agent_tasks',
        joinColumn: { name: 'agent_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'task_id', referencedColumnName: 'id' }
    })
    tasks!: Task[];

    @ManyToMany(() => Team)
    @JoinTable({
        name: 'agent_teams',
        joinColumn: { name: 'agent_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'team_id', referencedColumnName: 'id' }
    })
    teams!: Team[];

    protected toDomainEvent(eventType: AgentEventType, data: AgentEventData): DomainEvent {
        return new AgentEvent(eventType, this.id, this.version, data);
    }

    applyEvent(event: DomainEvent): void {
        const eventType = event.eventType as AgentEventType;
        switch (eventType) {
            case AgentEventTypes.STATUS_UPDATED as AgentEventType:
                if (isAgentStatusEventData(event.data)) {
                    this.status = event.data.status;
                }
                break;

            case AgentEventTypes.ROLE_UPDATED as AgentEventType:
                if (isAgentRoleEventData(event.data)) {
                    this.role = event.data.role;
                }
                break;

            case AgentEventTypes.CAPABILITIES_UPDATED as AgentEventType:
                if (isAgentCapabilitiesEventData(event.data)) {
                    this.capabilities = event.data.capabilities;
                }
                break;

            case AgentEventTypes.PERFORMANCE_UPDATED as AgentEventType:
                if (isAgentPerformanceEventData(event.data)) {
                    this.performance_metrics = event.data.performance_metrics;
                }
                break;

            case AgentEventTypes.LEARNING_MODEL_UPDATED as AgentEventType:
                if (isAgentLearningModelEventData(event.data)) {
                    this.learning_model = event.data.learning_model;
                }
                break;

            case AgentEventTypes.WORKING_MEMORY_UPDATED as AgentEventType:
                if (isAgentWorkingMemoryEventData(event.data)) {
                    this.working_memory = event.data.working_memory;
                }
                break;

            case AgentEventTypes.COMMUNICATION_UPDATED as AgentEventType:
                if (isAgentCommunicationEventData(event.data)) {
                    this.communication = event.data.communication;
                }
                break;

            case AgentEventTypes.ASSIGNED_TO_PROJECT as AgentEventType:
            case AgentEventTypes.REMOVED_FROM_PROJECT as AgentEventType:
                if (isAgentAssignmentEventData(event.data) && event.data.entityType === 'project') {
                    // Note: Actual project assignment/removal is handled by the repository
                    // This event is used for tracking purposes
                }
                break;

            case AgentEventTypes.ASSIGNED_TO_TASK as AgentEventType:
            case AgentEventTypes.REMOVED_FROM_TASK as AgentEventType:
                if (isAgentAssignmentEventData(event.data) && event.data.entityType === 'task') {
                    // Note: Actual task assignment/removal is handled by the repository
                    // This event is used for tracking purposes
                }
                break;

            case AgentEventTypes.JOINED_TEAM as AgentEventType:
            case AgentEventTypes.LEFT_TEAM as AgentEventType:
                if (isAgentTeamEventData(event.data)) {
                    // Note: Actual team membership changes are handled by the repository
                    // This event is used for tracking purposes
                }
                break;
        }
    }
}

export class AgentEvent extends DomainEvent {
    constructor(
        eventType: AgentEventType,
        aggregateId: string,
        version: number,
        data: AgentEventData
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
