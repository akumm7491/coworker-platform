import { Entity, Column, ManyToMany, ManyToOne, Index } from 'typeorm';
import { Task as SharedTask } from '@coworker/shared/database/entities/Task';
import {
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskRequirements,
  TaskDependencies,
  TaskExecutionPlan,
  TaskValidationResult,
  TaskMetrics,
} from '@coworker/shared/types/agent';
import { Agent } from './agent.entity';
import { Project } from './project.entity';
import { DomainEvent } from '@coworker/shared/events/definitions/DomainEvent';
import {
  TaskEventTypes,
  isTaskStatusEventData,
  isTaskProgressEventData,
  isTaskRequirementsEventData,
  isTaskDependenciesEventData,
  isTaskExecutionPlanEventData,
  isTaskValidationResultEventData,
  isTaskMetricsEventData,
  isTaskAgentAssignmentEventData,
  isTaskTypeEventData,
  isTaskPriorityEventData,
  isTaskSubtasksEventData,
  isTaskDeadlineEventData,
  TaskStatusEventData,
} from '../events/task.events';

@Entity('tasks')
export class Task extends SharedTask {
  @Column()
  @Index()
  declare name: string;

  @Column('text')
  declare description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  declare status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  declare priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.DEVELOPMENT,
  })
  declare type: TaskType;

  @Column('integer', { default: 0 })
  declare progress: number;

  @Column('jsonb')
  requirements!: TaskRequirements;

  @Column('jsonb')
  dependencies!: TaskDependencies;

  @Column('jsonb')
  execution_plan!: TaskExecutionPlan;

  @Column('jsonb', { array: true })
  validation_results!: TaskValidationResult[];

  @Column('jsonb')
  metrics!: TaskMetrics;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column('text', { array: true, default: [] })
  tags!: string[];

  @Column('timestamp with time zone', { nullable: true })
  deadline?: Date;

  @ManyToOne(() => Project, project => project.tasks)
  project!: Project;

  @ManyToMany(() => Agent, agent => agent.tasks)
  assigned_agents!: Agent[];

  @Column('timestamp with time zone')
  private _createdAt!: Date;

  // Domain-specific methods
  setStatus(newStatus: TaskStatus): void {
    if (this.status !== newStatus) {
      const eventData: TaskStatusEventData = {
        status: newStatus,
      };

      this.addDomainEvent({
        eventType: TaskEventTypes.STATUS_UPDATED,
        data: eventData,
        occurredOn: new Date(),
        aggregateId: this.id.toString(), // Fixing the aggregateId reference
        version: this.version,
        toJSON: function (): Record<string, unknown> {
          return {
            eventType: TaskEventTypes.STATUS_UPDATED,
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
      case TaskEventTypes.STATUS_UPDATED:
        if (isTaskStatusEventData(data)) {
          this.status = data.status;
        }
        break;

      case TaskEventTypes.PROGRESS_UPDATED:
        if (isTaskProgressEventData(data)) {
          this.progress = data.progress;
        }
        break;

      case TaskEventTypes.REQUIREMENTS_UPDATED:
        if (isTaskRequirementsEventData(data)) {
          this.requirements = {
            functional: data.functional,
            technical: data.technical,
            acceptance_criteria: data.acceptance_criteria,
          };
        }
        break;

      case TaskEventTypes.DEPENDENCIES_UPDATED:
        if (isTaskDependenciesEventData(data)) {
          this.dependencies = {
            tasks: data.dependencies,
            resources: [],
            external: [],
          };
        }
        break;

      case TaskEventTypes.EXECUTION_PLAN_UPDATED:
        if (isTaskExecutionPlanEventData(data)) {
          const totalEstimatedDuration = data.steps.reduce(
            (total, step) => total + (step.estimated_duration || 0),
            0
          );

          this.execution_plan = {
            steps: data.steps,
            estimated_duration: totalEstimatedDuration,
            actual_duration: undefined,
          };
        }
        break;

      case TaskEventTypes.VALIDATION_RESULT_ADDED:
        if (isTaskValidationResultEventData(data)) {
          this.validation_results = [
            ...this.validation_results,
            {
              timestamp: data.timestamp.toISOString(),
              type: data.type,
              status: data.status,
              details: data.details,
            },
          ];
        }
        break;

      case TaskEventTypes.METRICS_UPDATED:
        if (isTaskMetricsEventData(data)) {
          const metrics: TaskMetrics = {
            code_quality: data.code_quality,
            test_coverage: data.test_coverage,
            performance_score: data.performance_score,
            complexity: data.complexity,
          };
          this.metrics = metrics;
        }
        break;

      case TaskEventTypes.AGENT_ASSIGNED:
        if (isTaskAgentAssignmentEventData(data)) {
          // Note: This only updates the agent IDs. The actual Agent entities
          // need to be loaded separately if needed.
          this.assigned_agents = [{ id: data.agent_id } as Agent];
        }
        break;

      case TaskEventTypes.TYPE_UPDATED:
        if (isTaskTypeEventData(data)) {
          this.type = data.type;
        }
        break;

      case TaskEventTypes.PRIORITY_UPDATED:
        if (isTaskPriorityEventData(data)) {
          this.priority = data.priority;
        }
        break;

      case TaskEventTypes.SUBTASKS_UPDATED:
        if (isTaskSubtasksEventData(data)) {
          this.metadata = {
            ...this.metadata,
            subtasks: data.subtasks,
          };
        }
        break;

      case TaskEventTypes.DEADLINE_UPDATED:
        if (isTaskDeadlineEventData(data)) {
          this.deadline = data.deadline;
        }
        break;

      default:
        throw new Error(`Unhandled event type: ${eventType}`);
    }
  }
}
