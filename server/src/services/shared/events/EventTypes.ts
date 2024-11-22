export enum AgentEventType {
  // Agent lifecycle events
  AGENT_CREATED = 'agent.created',
  AGENT_UPDATED = 'agent.updated',
  AGENT_DELETED = 'agent.deleted',
  AGENT_ACTIVATED = 'agent.activated',
  AGENT_DEACTIVATED = 'agent.deactivated',

  // Task-related events
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_ASSIGNED = 'task.assigned',
  TASK_STARTED = 'task.started',
  TASK_COMPLETED = 'task.completed',
  TASK_FAILED = 'task.failed',
  TASK_CANCELLED = 'task.cancelled',

  // Task execution events
  TASK_EXECUTION_QUEUED = 'task.execution.queued',
  TASK_EXECUTION_STARTED = 'task.execution.started',
  TASK_EXECUTION_COMPLETED = 'task.execution.completed',
  TASK_EXECUTION_FAILED = 'task.execution.failed',
  TASK_EXECUTION_CANCELLED = 'task.execution.cancelled',

  // Team events
  TEAM_CREATED = 'team.created',
  TEAM_UPDATED = 'team.updated',
  TEAM_DELETED = 'team.deleted',
  AGENT_ADDED_TO_TEAM = 'team.agent.added',
  AGENT_REMOVED_FROM_TEAM = 'team.agent.removed',

  // Collaboration events
  COLLABORATION_STARTED = 'collaboration.started',
  COLLABORATION_ENDED = 'collaboration.ended',
  KNOWLEDGE_SHARED = 'collaboration.knowledge.shared',

  // Knowledge events
  KNOWLEDGE_CREATED = 'knowledge.created',
  KNOWLEDGE_UPDATED = 'knowledge.updated',
  KNOWLEDGE_DELETED = 'knowledge.deleted',
  KNOWLEDGE_SYNCED = 'knowledge.synced',

  // System events
  SYSTEM_ERROR = 'system.error',
  SYSTEM_WARNING = 'system.warning',
  SYSTEM_INFO = 'system.info',
}

export interface AgentEventPayload {
  agentId: string;
  [key: string]: any;
}

export interface TaskEventPayload {
  taskId: string;
  agentId: string;
  [key: string]: any;
}

export interface TeamEventPayload {
  teamId: string;
  [key: string]: any;
}

export interface CollaborationEventPayload {
  sessionId: string;
  agentIds: string[];
  [key: string]: any;
}

export interface KnowledgeEventPayload {
  agentId: string;
  knowledgeId: string;
  [key: string]: any;
}

export interface SystemEventPayload {
  code: string;
  message: string;
  details?: any;
  [key: string]: any;
}

export type EventPayload =
  | AgentEventPayload
  | TaskEventPayload
  | TeamEventPayload
  | CollaborationEventPayload
  | KnowledgeEventPayload
  | SystemEventPayload;
