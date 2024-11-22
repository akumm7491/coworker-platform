import {
  BaseEventType,
  BaseEventMetadata,
  BaseEventPayload,
} from '../../../shared/events/EventTypes.js';

export enum AgentEventType {
  // Common events from BaseEventType
  CREATED = BaseEventType.CREATED,
  UPDATED = BaseEventType.UPDATED,
  DELETED = BaseEventType.DELETED,
  ERROR = BaseEventType.ERROR,

  // Agent-specific events
  TASK_QUEUED = 'agent.task.queued',
  TASK_STARTED = 'agent.task.started',
  TASK_COMPLETED = 'agent.task.completed',
  TASK_FAILED = 'agent.task.failed',
  TASK_STALLED = 'agent.task.stalled',
  KNOWLEDGE_SHARED = 'agent.knowledge.shared',
  SESSION_CREATED = 'agent.session.created',
  SESSION_ENDED = 'agent.session.ended',
}

export interface AgentEventMetadata extends BaseEventMetadata {
  agentId?: string;
  taskId?: string;
}

export interface AgentEventPayload extends BaseEventPayload {
  taskType?: string;
  result?: unknown;
}
