import { Entity, Column, OneToMany, ManyToMany, JoinTable, Index } from 'typeorm';
import { AggregateRoot } from '../base/AggregateRoot';
import { ProjectStatus } from '../../types/agent';
import { DomainEvent, EventData } from '../../events/definitions/DomainEvent';
import { Task } from './Task';
import { Agent } from './Agent';

// Event Data Interfaces
export interface ProjectRequirementsEventData extends EventData {
    requirements: string[];
}

export interface ProjectVisionEventData extends EventData {
    vision: {
        goals: string[];
        constraints: string[];
        success_criteria: string[];
    };
}

export interface ProjectStatusEventData extends EventData {
    status: ProjectStatus;
}

export interface ProjectDesignSystemEventData extends EventData {
    designSystem: {
        colors: Record<string, string>;
        typography: Record<string, unknown>;
        spacing: Record<string, number>;
        components: Record<string, unknown>;
    };
}

export interface ProjectIntegrationEventData extends EventData {
    integration: {
        type: string;
        config: Record<string, unknown>;
    };
}

export interface ProjectAnalyticsEventData extends EventData {
    analytics: {
        metrics: Record<string, number>;
        dimensions: Record<string, string>;
    };
}

export interface ProjectFeatureEventData extends EventData {
    feature: {
        name: string;
        enabled: boolean;
        config?: Record<string, unknown>;
    };
}

export interface ProjectLeadAgentEventData extends EventData {
    agentId: string;
}

// Additional Event Data Interfaces for Project lifecycle events
export interface ProjectStartedEventData extends EventData {
    timestamp: Date;
    startDate: Date;
    initialStatus: ProjectStatus;
}

export interface ProjectCompletedEventData extends EventData {
    timestamp: Date;
    completionDate: Date;
    finalStatus: ProjectStatus;
    metrics?: Record<string, number>;
}

export interface ProjectHoldEventData extends EventData {
    timestamp: Date;
    reason: string;
    expectedResumptionDate?: Date;
}

export interface ProjectResumedEventData extends EventData {
    timestamp: Date;
    previousStatus: ProjectStatus;
    updatedTimeline?: {
        newDeadline?: Date;
        adjustedMilestones?: Record<string, Date>;
    };
}

// Local Project Event Types
export enum ProjectEventTypes {
    REQUIREMENTS_UPDATED = 'ProjectRequirementsUpdated',
    VISION_UPDATED = 'ProjectVisionUpdated',
    STATUS_UPDATED = 'ProjectStatusUpdated',
    DESIGN_SYSTEM_UPDATED = 'ProjectDesignSystemUpdated',
    INTEGRATION_ENABLED = 'ProjectIntegrationEnabled',
    INTEGRATION_DISABLED = 'ProjectIntegrationDisabled',
    INTEGRATION_UPDATED = 'ProjectIntegrationUpdated',
    ANALYTICS_UPDATED = 'ProjectAnalyticsUpdated',
    FEATURE_TOGGLED = 'ProjectFeatureToggled',
    STARTED = 'ProjectStarted',
    COMPLETED = 'ProjectCompleted',
    PUT_ON_HOLD = 'ProjectPutOnHold',
    RESUMED = 'ProjectResumed',
    LEAD_AGENT_ASSIGNED = 'ProjectLeadAgentAssigned'
}

// Type alias for all possible project event data types
export type ProjectEventData =
    | ProjectRequirementsEventData
    | ProjectVisionEventData
    | ProjectStatusEventData
    | ProjectDesignSystemEventData
    | ProjectIntegrationEventData
    | ProjectAnalyticsEventData
    | ProjectFeatureEventData
    | ProjectLeadAgentEventData
    | ProjectStartedEventData
    | ProjectCompletedEventData
    | ProjectHoldEventData
    | ProjectResumedEventData;

// Type Guards
export function isProjectRequirementsEventData(data: unknown): data is ProjectRequirementsEventData {
    const d = data as ProjectRequirementsEventData;
    return typeof d === 'object' &&
           d !== null &&
           Array.isArray(d.requirements) && 
           d.requirements.every(req => typeof req === 'string');
}

export function isProjectVisionEventData(data: unknown): data is ProjectVisionEventData {
    const d = data as ProjectVisionEventData;
    if (!d || typeof d !== 'object' || !d.vision || typeof d.vision !== 'object') return false;
    const vision = d.vision;
    return Array.isArray(vision.goals) && vision.goals.every(g => typeof g === 'string') &&
           Array.isArray(vision.constraints) && vision.constraints.every(c => typeof c === 'string') &&
           Array.isArray(vision.success_criteria) && vision.success_criteria.every(sc => typeof sc === 'string');
}

export function isProjectStatusEventData(data: unknown): data is ProjectStatusEventData {
    const d = data as ProjectStatusEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.status === 'string' &&
           Object.values(ProjectStatus).includes(d.status as ProjectStatus);
}

export function isProjectDesignSystemEventData(data: unknown): data is ProjectDesignSystemEventData {
    const d = data as ProjectDesignSystemEventData;
    if (!d || typeof d !== 'object' || !d.designSystem || typeof d.designSystem !== 'object') return false;
    const ds = d.designSystem;
    return typeof ds.colors === 'object' && ds.colors !== null &&
           typeof ds.typography === 'object' && ds.typography !== null &&
           typeof ds.spacing === 'object' && ds.spacing !== null &&
           typeof ds.components === 'object' && ds.components !== null;
}

export function isProjectIntegrationEventData(data: unknown): data is ProjectIntegrationEventData {
    const d = data as ProjectIntegrationEventData;
    if (!d || typeof d !== 'object' || !d.integration || typeof d.integration !== 'object') return false;
    return typeof d.integration.type === 'string' &&
           typeof d.integration.config === 'object' &&
           d.integration.config !== null;
}

export function isProjectAnalyticsEventData(data: unknown): data is ProjectAnalyticsEventData {
    const d = data as ProjectAnalyticsEventData;
    if (!d || typeof d !== 'object' || !d.analytics || typeof d.analytics !== 'object') return false;
    return typeof d.analytics.metrics === 'object' && d.analytics.metrics !== null &&
           typeof d.analytics.dimensions === 'object' && d.analytics.dimensions !== null;
}

export function isProjectFeatureEventData(data: unknown): data is ProjectFeatureEventData {
    const d = data as ProjectFeatureEventData;
    if (!d || typeof d !== 'object' || !d.feature || typeof d.feature !== 'object') return false;
    return typeof d.feature.name === 'string' &&
           typeof d.feature.enabled === 'boolean' &&
           (d.feature.config === undefined || 
            (typeof d.feature.config === 'object' && d.feature.config !== null));
}

export function isProjectLeadAgentEventData(data: unknown): data is ProjectLeadAgentEventData {
    const d = data as ProjectLeadAgentEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.agentId === 'string';
}

export function isProjectStartedEventData(data: unknown): data is ProjectStartedEventData {
    const d = data as ProjectStartedEventData;
    return typeof d === 'object' &&
           d !== null &&
           d.timestamp instanceof Date &&
           d.startDate instanceof Date &&
           typeof d.initialStatus === 'string';
}

export function isProjectCompletedEventData(data: unknown): data is ProjectCompletedEventData {
    const d = data as ProjectCompletedEventData;
    return typeof d === 'object' &&
           d !== null &&
           d.timestamp instanceof Date &&
           d.completionDate instanceof Date &&
           typeof d.finalStatus === 'string' &&
           (d.metrics === undefined || typeof d.metrics === 'object');
}

export function isProjectHoldEventData(data: unknown): data is ProjectHoldEventData {
    const d = data as ProjectHoldEventData;
    return typeof d === 'object' &&
           d !== null &&
           d.timestamp instanceof Date &&
           typeof d.reason === 'string' &&
           (d.expectedResumptionDate === undefined || d.expectedResumptionDate instanceof Date);
}

export function isProjectResumedEventData(data: unknown): data is ProjectResumedEventData {
    const d = data as ProjectResumedEventData;
    return typeof d === 'object' &&
           d !== null &&
           d.timestamp instanceof Date &&
           typeof d.previousStatus === 'string' &&
           (d.updatedTimeline === undefined || 
            (typeof d.updatedTimeline === 'object' &&
             (d.updatedTimeline.newDeadline === undefined || d.updatedTimeline.newDeadline instanceof Date) &&
             (d.updatedTimeline.adjustedMilestones === undefined || typeof d.updatedTimeline.adjustedMilestones === 'object')));
}

@Entity('projects')
export class Project extends AggregateRoot {
    @Column()
    @Index()
    name!: string;

    @Column('text')
    description!: string;

    @Column('text', { array: true, default: [] })
    requirements!: string[];

    @Column('jsonb', { default: {} })
    vision!: {
        goals: string[];
        constraints: string[];
        success_criteria: string[];
    };

    @Column({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.PLANNING
    })
    status!: ProjectStatus;

    @Column('timestamp', { nullable: true })
    start_date?: Date;

    @Column('timestamp', { nullable: true })
    completion_date?: Date;

    @Column('jsonb', { nullable: true })
    completion_metrics?: Record<string, number>;

    @Column('timestamp', { nullable: true })
    hold_date?: Date;

    @Column('text', { nullable: true })
    hold_reason?: string;

    @Column('timestamp', { nullable: true })
    expected_resumption_date?: Date;

    @Column('jsonb', { nullable: true })
    timeline?: {
        deadline?: Date;
        milestones: Record<string, Date>;
    };

    @Column('jsonb', { default: {} })
    design_system!: {
        colors: Record<string, string>;
        typography: Record<string, unknown>;
        spacing: Record<string, number>;
        components: Record<string, unknown>;
    };

    @Column('jsonb', { default: [] })
    integrations!: Array<{
        type: string;
        enabled: boolean;
        config: Record<string, unknown>;
    }>;

    @Column('jsonb', { default: {} })
    analytics!: {
        metrics: Record<string, number>;
        dimensions: Record<string, string>;
    };

    @Column('jsonb', { default: {} })
    features!: Record<string, {
        enabled: boolean;
        config?: Record<string, unknown>;
    }>;

    @Column({ nullable: true })
    lead_agent_id?: string;

    @OneToMany(() => Task, task => task.project)
    tasks!: Task[];

    @ManyToMany(() => Agent)
    @JoinTable({
        name: 'project_agents',
        joinColumn: { name: 'project_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'agent_id', referencedColumnName: 'id' }
    })
    agents!: Agent[];

    protected toDomainEvent(eventType: ProjectEventTypes, data: ProjectEventData): DomainEvent {
        return new ProjectEvent(eventType, this.id, this.version, data);
    }

    applyEvent(event: DomainEvent): void {
        switch (event.eventType as ProjectEventTypes) {
            case ProjectEventTypes.REQUIREMENTS_UPDATED:
                if (isProjectRequirementsEventData(event.data)) {
                    this.requirements = event.data.requirements;
                }
                break;
            case ProjectEventTypes.VISION_UPDATED:
                if (isProjectVisionEventData(event.data)) {
                    this.vision = event.data.vision;
                }
                break;
            case ProjectEventTypes.STATUS_UPDATED:
                if (isProjectStatusEventData(event.data)) {
                    this.status = event.data.status;
                }
                break;
            case ProjectEventTypes.DESIGN_SYSTEM_UPDATED:
                if (isProjectDesignSystemEventData(event.data)) {
                    this.design_system = event.data.designSystem;
                }
                break;
            case ProjectEventTypes.INTEGRATION_ENABLED:
            case ProjectEventTypes.INTEGRATION_DISABLED:
            case ProjectEventTypes.INTEGRATION_UPDATED:
                if (isProjectIntegrationEventData(event.data)) {
                    const { type, config } = event.data.integration;
                    const existingIndex = this.integrations.findIndex(i => i.type === type);
                    if (existingIndex >= 0) {
                        this.integrations[existingIndex] = {
                            type,
                            config,
                            enabled: event.eventType === ProjectEventTypes.INTEGRATION_ENABLED
                        };
                    } else {
                        this.integrations.push({
                            type,
                            config,
                            enabled: event.eventType === ProjectEventTypes.INTEGRATION_ENABLED
                        });
                    }
                }
                break;
            case ProjectEventTypes.ANALYTICS_UPDATED:
                if (isProjectAnalyticsEventData(event.data)) {
                    this.analytics = event.data.analytics;
                }
                break;
            case ProjectEventTypes.FEATURE_TOGGLED:
                if (isProjectFeatureEventData(event.data)) {
                    const { name, ...featureData } = event.data.feature;
                    this.features[name] = featureData;
                }
                break;
            case ProjectEventTypes.LEAD_AGENT_ASSIGNED:
                if (isProjectLeadAgentEventData(event.data)) {
                    this.lead_agent_id = event.data.agentId;
                }
                break;
            case ProjectEventTypes.STARTED:
                if (isProjectStartedEventData(event.data)) {
                    this.status = event.data.initialStatus;
                    this.start_date = event.data.startDate;
                }
                break;
            case ProjectEventTypes.COMPLETED:
                if (isProjectCompletedEventData(event.data)) {
                    this.status = event.data.finalStatus;
                    this.completion_date = event.data.completionDate;
                    if (event.data.metrics) {
                        this.completion_metrics = event.data.metrics;
                    }
                }
                break;
            case ProjectEventTypes.PUT_ON_HOLD:
                if (isProjectHoldEventData(event.data)) {
                    this.status = ProjectStatus.ON_HOLD;
                    this.hold_date = event.data.timestamp;
                    this.hold_reason = event.data.reason;
                    if (event.data.expectedResumptionDate) {
                        this.expected_resumption_date = event.data.expectedResumptionDate;
                    }
                }
                break;
            case ProjectEventTypes.RESUMED:
                if (isProjectResumedEventData(event.data)) {
                    this.status = event.data.previousStatus;
                    this.hold_date = undefined;
                    this.hold_reason = undefined;
                    this.expected_resumption_date = undefined;
                    
                    if (event.data.updatedTimeline) {
                        this.timeline = {
                            deadline: event.data.updatedTimeline.newDeadline,
                            milestones: event.data.updatedTimeline.adjustedMilestones || {}
                        };
                    }
                }
                break;
        }
    }
}

export class ProjectEvent extends DomainEvent {
    constructor(
        eventType: ProjectEventTypes,
        aggregateId: string,
        version: number,
        data: ProjectEventData
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
