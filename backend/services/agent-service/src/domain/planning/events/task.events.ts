import { EventData } from '@coworker/shared/events/definitions/DomainEvent';
import { TaskStatus, TaskPriority, TaskType } from '@coworker/shared/types/agent';

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
  DEADLINE_UPDATED = 'TaskDeadlineUpdated',
}

// Event Data Interfaces
export interface TaskStatusEventData extends EventData {
  status: TaskStatus;
}

export interface TaskProgressEventData extends EventData {
  progress: number; // 0-100
}

export interface TaskRequirementsEventData extends EventData {
  functional: string[];
  technical: string[];
  acceptance_criteria: string[];
}

export interface TaskDependenciesEventData extends EventData {
  dependencies: string[]; // Task IDs
}

export interface TaskExecutionPlanEventData extends EventData {
  steps: Array<{
    order: number;
    description: string;
    status: TaskStatus;
    estimated_duration?: number; // in minutes
  }>;
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
  subtasks: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
}

export interface TaskDeadlineEventData extends EventData {
  deadline: Date;
}

// Type Guards
export function isTaskStatusEventData(data: unknown): data is TaskStatusEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    typeof (data as TaskStatusEventData).status === 'string'
  );
}

export function isTaskProgressEventData(data: unknown): data is TaskProgressEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'progress' in data &&
    typeof (data as TaskProgressEventData).progress === 'number'
  );
}

export function isTaskRequirementsEventData(data: unknown): data is TaskRequirementsEventData {
  const d = data as TaskRequirementsEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'functional' in d &&
    Array.isArray(d.functional) &&
    'technical' in d &&
    Array.isArray(d.technical) &&
    'acceptance_criteria' in d &&
    Array.isArray(d.acceptance_criteria)
  );
}

export function isTaskDependenciesEventData(data: unknown): data is TaskDependenciesEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'dependencies' in data &&
    Array.isArray((data as TaskDependenciesEventData).dependencies)
  );
}

export function isTaskExecutionPlanEventData(data: unknown): data is TaskExecutionPlanEventData {
  const d = data as TaskExecutionPlanEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'steps' in d &&
    Array.isArray(d.steps) &&
    d.steps.every(
      step =>
        typeof step === 'object' &&
        'order' in step &&
        typeof step.order === 'number' &&
        'description' in step &&
        typeof step.description === 'string' &&
        'status' in step &&
        typeof step.status === 'string'
    )
  );
}

export function isTaskValidationResultEventData(
  data: unknown
): data is TaskValidationResultEventData {
  const d = data as TaskValidationResultEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'timestamp' in d &&
    d.timestamp instanceof Date &&
    'type' in d &&
    typeof d.type === 'string' &&
    'status' in d &&
    (d.status === 'pass' || d.status === 'fail') &&
    'details' in d &&
    typeof d.details === 'object'
  );
}

export function isTaskMetricsEventData(data: unknown): data is TaskMetricsEventData {
  const d = data as TaskMetricsEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    (!('code_quality' in d) || typeof d.code_quality === 'number') &&
    (!('test_coverage' in d) || typeof d.test_coverage === 'number') &&
    (!('performance_score' in d) || typeof d.performance_score === 'number') &&
    (!('complexity' in d) || typeof d.complexity === 'number')
  );
}

export function isTaskAgentAssignmentEventData(
  data: unknown
): data is TaskAgentAssignmentEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'agent_id' in data &&
    typeof (data as TaskAgentAssignmentEventData).agent_id === 'string'
  );
}

export function isTaskTypeEventData(data: unknown): data is TaskTypeEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    typeof (data as TaskTypeEventData).type === 'string'
  );
}

export function isTaskPriorityEventData(data: unknown): data is TaskPriorityEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'priority' in data &&
    typeof (data as TaskPriorityEventData).priority === 'string'
  );
}

export function isTaskSubtasksEventData(data: unknown): data is TaskSubtasksEventData {
  const d = data as TaskSubtasksEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'subtasks' in d &&
    Array.isArray(d.subtasks) &&
    d.subtasks.every(
      subtask =>
        typeof subtask === 'object' &&
        'id' in subtask &&
        typeof subtask.id === 'string' &&
        'name' in subtask &&
        typeof subtask.name === 'string' &&
        'completed' in subtask &&
        typeof subtask.completed === 'boolean'
    )
  );
}

export function isTaskDeadlineEventData(data: unknown): data is TaskDeadlineEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'deadline' in data &&
    (data as TaskDeadlineEventData).deadline instanceof Date
  );
}
