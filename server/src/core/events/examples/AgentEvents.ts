import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Event, EventMetadata } from '../types.js';

// Agent Event Types
export const AgentEventTypes = {
  AGENT_CREATED: 'AGENT_CREATED',
  AGENT_UPDATED: 'AGENT_UPDATED',
  AGENT_DELETED: 'AGENT_DELETED',
  AGENT_TASK_ASSIGNED: 'AGENT_TASK_ASSIGNED',
  AGENT_TASK_COMPLETED: 'AGENT_TASK_COMPLETED',
  AGENT_LEARNING_COMPLETED: 'AGENT_LEARNING_COMPLETED',
} as const;

// Event Payload Schemas
export const AgentCreatedPayloadSchema = z.object({
  name: z.string(),
  type: z.string(),
  capabilities: z.object({
    skills: z.array(z.string()),
    languages: z.array(z.string()),
  }),
  settings: z.record(z.unknown()),
});

export const AgentTaskAssignedPayloadSchema = z.object({
  taskId: z.string().uuid(),
  taskType: z.string(),
  priority: z.number(),
  deadline: z.date().optional(),
});

// Event Creation Functions
export function createAgentCreatedEvent(
  agentId: string,
  payload: z.infer<typeof AgentCreatedPayloadSchema>,
  metadata: Partial<EventMetadata> = {},
): Event {
  return {
    id: uuidv4(),
    type: AgentEventTypes.AGENT_CREATED,
    aggregateId: agentId,
    aggregateType: 'agent',
    metadata: {
      timestamp: new Date(),
      version: 1,
      correlationId: uuidv4(),
      ...metadata,
    },
    payload,
  };
}

export function createAgentUpdatedEvent(
  agentId: string,
  payload: Partial<z.infer<typeof AgentCreatedPayloadSchema>>,
  metadata: Partial<EventMetadata> = {},
): Event {
  return {
    id: uuidv4(),
    type: AgentEventTypes.AGENT_UPDATED,
    aggregateId: agentId,
    aggregateType: 'agent',
    metadata: {
      timestamp: new Date(),
      version: 1,
      correlationId: uuidv4(),
      ...metadata,
    },
    payload,
  };
}

export function createAgentTaskAssignedEvent(
  agentId: string,
  payload: z.infer<typeof AgentTaskAssignedPayloadSchema>,
  metadata: Partial<EventMetadata> = {},
): Event {
  return {
    id: uuidv4(),
    type: AgentEventTypes.AGENT_TASK_ASSIGNED,
    aggregateId: agentId,
    aggregateType: 'agent',
    metadata: {
      timestamp: new Date(),
      version: 1,
      correlationId: uuidv4(),
      ...metadata,
    },
    payload,
  };
}

export function createAgentTaskCompletedEvent(
  agentId: string,
  payload: {
    taskId: string;
    result: unknown;
    status: 'SUCCESS' | 'FAILURE';
    error?: string;
  },
  metadata: Partial<EventMetadata> = {},
): Event {
  return {
    id: uuidv4(),
    type: AgentEventTypes.AGENT_TASK_COMPLETED,
    aggregateId: agentId,
    aggregateType: 'agent',
    metadata: {
      timestamp: new Date(),
      version: 1,
      correlationId: uuidv4(),
      ...metadata,
    },
    payload,
  };
}

// Example usage:
/*
const event = createAgentCreatedEvent('agent-123', {
  name: 'Development Agent',
  type: 'specialized',
  capabilities: {
    skills: ['typescript', 'nodejs'],
    languages: ['javascript', 'python'],
  },
  settings: {
    maxConcurrentTasks: 3,
    learningRate: 0.1,
  },
});

await eventStore.append([event]);
*/
