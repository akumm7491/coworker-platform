import { Entity, Column, ManyToOne, ManyToMany, JoinTable, Index } from 'typeorm';
import { AggregateRoot } from '../base/AggregateRoot';
import { TaskStatus, TaskPriority, TaskType } from '../../types/agent';
import { DomainEvent, EventData } from '../../events/definitions/DomainEvent';
import { Project } from './Project';
import { Agent } from './Agent';

export enum TaskEventTypes {
    STATUS_UPDATED = 'TaskStatusUpdated',
    PROGRESS_UPDATED = 'TaskProgressUpdated',
    REQUIREMENTS_UPDATED = 'TaskRequirementsUpdated',
    DEPENDENCIES_UPDATED = 'TaskDependenciesUpdated',
    EXECUTION_PLAN_UPDATED = 'TaskExecutionPlanUpdated',
    VALIDATION_RESULT_ADDED = 'TaskValidationResultAdded',
    METRICS_UPDATED = 'TaskMetricsUpdated',
    AGENT_ASSIGNED = 'TaskAgentAssigned',
    AGENT_UNASSIGNED = 'TaskAgentUnassigned',
    STARTED = 'TaskStarted',
    COMPLETED = 'TaskCompleted',
    BLOCKED = 'TaskBlocked',
    UNBLOCKED = 'TaskUnblocked',
    TYPE_UPDATED = 'TaskTypeUpdated',
    PRIORITY_UPDATED = 'TaskPriorityUpdated',
    SUBTASKS_UPDATED = 'TaskSubtasksUpdated',
    DEADLINE_UPDATED = 'TaskDeadlineUpdated'
}

// Event Data Interfaces
export interface TaskStatusEventData extends EventData {
    status: TaskStatus;
}

export interface TaskProgressEventData extends EventData {
    progress: number;  // 0-100
}

export interface TaskRequirementsEventData extends EventData {
    functional: string[];
    technical: string[];
    acceptance_criteria: string[];
}

export interface TaskDependenciesEventData extends EventData {
    dependencies: string[];  // Task IDs
}

export interface TaskExecutionPlanEventData extends EventData {
    steps: Array<{
        order: number;
        description: string;
        status: TaskStatus;
        agent_id?: string;
    }>;
    estimated_duration: number;
    actual_duration?: number;
}

export interface TaskValidationResultEventData extends EventData {
    timestamp: Date;
    type: string;
    status: 'pass' | 'fail';
    details: Record<string, unknown>;
}

export interface TaskMetricsEventData extends EventData {
    code_quality?: number;
    test_coverage?: number;
    performance_score?: number;
    complexity?: number;
}

export interface TaskAgentAssignmentEventData extends EventData {
    agent_id: string;
}

export interface TaskTypeEventData extends EventData {
    type: TaskType;
}

export interface TaskPriorityEventData extends EventData {
    priority: TaskPriority;
}

export interface TaskSubtasksEventData extends EventData {
    subtasks: {
        id: string;
        name: string;
        completed: boolean;
    }[];
}

export interface TaskDeadlineEventData extends EventData {
    deadline: Date;
}

// Type alias for all possible task event data types
export type TaskEventData = 
    | TaskStatusEventData
    | TaskProgressEventData
    | TaskRequirementsEventData
    | TaskDependenciesEventData
    | TaskExecutionPlanEventData
    | TaskValidationResultEventData
    | TaskMetricsEventData
    | TaskAgentAssignmentEventData
    | TaskTypeEventData
    | TaskPriorityEventData
    | TaskSubtasksEventData
    | TaskDeadlineEventData;

// Type Guards
export function isTaskStatusEventData(data: unknown): data is TaskStatusEventData {
    const d = data as TaskStatusEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.status === 'string' &&
           Object.values(TaskStatus).includes(d.status as TaskStatus);
}

export function isTaskProgressEventData(data: unknown): data is TaskProgressEventData {
    const d = data as TaskProgressEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.progress === 'number' &&
           d.progress >= 0 &&
           d.progress <= 100;
}

export function isTaskRequirementsEventData(data: unknown): data is TaskRequirementsEventData {
    const d = data as TaskRequirementsEventData;
    return typeof d === 'object' &&
           d !== null &&
           Array.isArray(d.functional) &&
           Array.isArray(d.technical) &&
           Array.isArray(d.acceptance_criteria) &&
           d.functional.every(item => typeof item === 'string') &&
           d.technical.every(item => typeof item === 'string') &&
           d.acceptance_criteria.every(item => typeof item === 'string');
}

export function isTaskDependenciesEventData(data: unknown): data is TaskDependenciesEventData {
    const d = data as TaskDependenciesEventData;
    return typeof d === 'object' &&
           d !== null &&
           Array.isArray(d.dependencies) &&
           d.dependencies.every(id => typeof id === 'string');
}

export function isTaskExecutionPlanEventData(data: unknown): data is TaskExecutionPlanEventData {
    const d = data as TaskExecutionPlanEventData;
    return typeof d === 'object' &&
           d !== null &&
           Array.isArray(d.steps) &&
           d.steps.every(step =>
               typeof step === 'object' &&
               step !== null &&
               typeof step.order === 'number' &&
               typeof step.description === 'string' &&
               typeof step.status === 'string' &&
               Object.values(TaskStatus).includes(step.status as TaskStatus) &&
               (step.agent_id === undefined || typeof step.agent_id === 'string')
           ) &&
           typeof d.estimated_duration === 'number' &&
           (d.actual_duration === undefined || typeof d.actual_duration === 'number');
}

export function isTaskValidationResultEventData(data: unknown): data is TaskValidationResultEventData {
    const d = data as TaskValidationResultEventData;
    return typeof d === 'object' &&
           d !== null &&
           d.timestamp instanceof Date &&
           typeof d.type === 'string' &&
           (d.status === 'pass' || d.status === 'fail') &&
           typeof d.details === 'object';
}

export function isTaskMetricsEventData(data: unknown): data is TaskMetricsEventData {
    const d = data as TaskMetricsEventData;
    return typeof d === 'object' &&
           d !== null &&
           (d.code_quality === undefined || typeof d.code_quality === 'number') &&
           (d.test_coverage === undefined || typeof d.test_coverage === 'number') &&
           (d.performance_score === undefined || typeof d.performance_score === 'number') &&
           (d.complexity === undefined || typeof d.complexity === 'number');
}

export function isTaskAgentAssignmentEventData(data: unknown): data is TaskAgentAssignmentEventData {
    const d = data as TaskAgentAssignmentEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.agent_id === 'string';
}

export function isTaskTypeEventData(data: unknown): data is TaskTypeEventData {
    const d = data as TaskTypeEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.type === 'string' &&
           Object.values(TaskType).includes(d.type as TaskType);
}

export function isTaskPriorityEventData(data: unknown): data is TaskPriorityEventData {
    const d = data as TaskPriorityEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.priority === 'string' &&
           Object.values(TaskPriority).includes(d.priority as TaskPriority);
}

export function isTaskSubtasksEventData(data: unknown): data is TaskSubtasksEventData {
    const d = data as TaskSubtasksEventData;
    return typeof d === 'object' &&
           d !== null &&
           Array.isArray(d.subtasks) &&
           d.subtasks.every(subtask =>
               typeof subtask === 'object' &&
               subtask !== null &&
               typeof subtask.id === 'string' &&
               typeof subtask.name === 'string' &&
               typeof subtask.completed === 'boolean'
           );
}

export function isTaskDeadlineEventData(data: unknown): data is TaskDeadlineEventData {
    const d = data as TaskDeadlineEventData;
    return typeof d === 'object' &&
           d !== null &&
           d.deadline instanceof Date;
}

@Entity()
export class Task extends AggregateRoot {
    @Column()
    @Index()
    name!: string;

    @Column('text')
    description!: string;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.PENDING
    })
    status!: TaskStatus;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM
    })
    priority!: TaskPriority;

    @Column({
        type: 'enum',
        enum: TaskType,
        default: TaskType.DEVELOPMENT
    })
    type!: TaskType;

    @Column('text', { array: true, default: [] })
    dependencies!: string[];  // Task IDs

    @Column('jsonb', { default: [] })
    subtasks!: {
        id: string;
        name: string;
        completed: boolean;
    }[];

    @Column('integer', { default: 0 })
    progress!: number;  // 0-100

    @Column({ type: 'timestamp', nullable: true })
    deadline?: Date;

    @ManyToOne(() => Project, project => project.tasks)
    project!: Project;

    @Column()
    project_id!: string;

    @ManyToMany(() => Agent)
    @JoinTable({
        name: 'task_agents',
        joinColumn: { name: 'task_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'agent_id', referencedColumnName: 'id' }
    })
    assigned_agents!: Agent[];

    protected toDomainEvent(eventType: TaskEventTypes, data: TaskEventData): DomainEvent {
        return new TaskEvent(eventType, this.id, this.version, data);
    }

    applyEvent(event: DomainEvent): void {
        if (!Object.values(TaskEventTypes).includes(event.eventType as TaskEventTypes)) {
            return;
        }

        switch (event.eventType as TaskEventTypes) {
            case TaskEventTypes.STATUS_UPDATED:
                if (isTaskStatusEventData(event.data)) {
                    this.status = event.data.status;
                }
                break;
            case TaskEventTypes.PROGRESS_UPDATED:
                if (isTaskProgressEventData(event.data)) {
                    this.progress = event.data.progress;
                }
                break;
            case TaskEventTypes.REQUIREMENTS_UPDATED:
                if (isTaskRequirementsEventData(event.data)) {
                    // Update requirements through repository
                }
                break;
            case TaskEventTypes.DEPENDENCIES_UPDATED:
                if (isTaskDependenciesEventData(event.data)) {
                    this.dependencies = event.data.dependencies;
                }
                break;
            case TaskEventTypes.EXECUTION_PLAN_UPDATED:
                if (isTaskExecutionPlanEventData(event.data)) {
                    // Update execution plan through repository
                }
                break;
            case TaskEventTypes.VALIDATION_RESULT_ADDED:
                if (isTaskValidationResultEventData(event.data)) {
                    // Add validation result through repository
                }
                break;
            case TaskEventTypes.METRICS_UPDATED:
                if (isTaskMetricsEventData(event.data)) {
                    // Update metrics through repository
                }
                break;
            case TaskEventTypes.AGENT_ASSIGNED:
            case TaskEventTypes.AGENT_UNASSIGNED:
                if (isTaskAgentAssignmentEventData(event.data)) {
                    // Update agent assignments through repository
                }
                break;
            case TaskEventTypes.TYPE_UPDATED:
                if (isTaskTypeEventData(event.data)) {
                    this.type = event.data.type;
                }
                break;
            case TaskEventTypes.PRIORITY_UPDATED:
                if (isTaskPriorityEventData(event.data)) {
                    this.priority = event.data.priority;
                }
                break;
            case TaskEventTypes.SUBTASKS_UPDATED:
                if (isTaskSubtasksEventData(event.data)) {
                    this.subtasks = event.data.subtasks;
                }
                break;
            case TaskEventTypes.DEADLINE_UPDATED:
                if (isTaskDeadlineEventData(event.data)) {
                    this.deadline = event.data.deadline;
                }
                break;
            case TaskEventTypes.STARTED:
            case TaskEventTypes.COMPLETED:
            case TaskEventTypes.BLOCKED:
            case TaskEventTypes.UNBLOCKED:
                // These events might need additional handling depending on business logic
                break;
        }
    }
}

export class TaskEvent extends DomainEvent {
    constructor(
        eventType: TaskEventTypes,
        aggregateId: string,
        version: number,
        data: TaskEventData
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
