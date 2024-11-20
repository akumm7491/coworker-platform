import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Command, CommandMetadata } from '../types.js';

// Command Types
export const AgentCommandTypes = {
  CREATE_AGENT: 'CREATE_AGENT',
  UPDATE_AGENT: 'UPDATE_AGENT',
  ASSIGN_TASK: 'ASSIGN_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  START_AGENT: 'START_AGENT',
  STOP_AGENT: 'STOP_AGENT',
} as const;

// Command Payload Schemas
export const CreateAgentPayloadSchema = z.object({
  name: z.string(),
  capabilities: z.array(z.string()),
  configuration: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateAgentPayloadSchema = z.object({
  name: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
});

export const AssignTaskPayloadSchema = z.object({
  taskId: z.string().uuid(),
  taskType: z.string(),
  priority: z.number().int().min(1).max(5).default(3),
  parameters: z.record(z.string(), z.unknown()),
});

export const CompleteTaskPayloadSchema = z.object({
  taskId: z.string().uuid(),
  result: z.unknown(),
  status: z.enum(['SUCCESS', 'FAILURE']),
  error: z.string().optional(),
});

// Command Creation Functions
export function createCreateAgentCommand(
  payload: z.infer<typeof CreateAgentPayloadSchema>,
  metadata: CommandMetadata,
): Command {
  return {
    id: uuidv4(),
    type: AgentCommandTypes.CREATE_AGENT,
    payload,
    metadata,
  };
}

export function createUpdateAgentCommand(
  payload: z.infer<typeof UpdateAgentPayloadSchema>,
  metadata: CommandMetadata,
): Command {
  return {
    id: uuidv4(),
    type: AgentCommandTypes.UPDATE_AGENT,
    payload,
    metadata,
  };
}

export function createAssignTaskCommand(
  payload: z.infer<typeof AssignTaskPayloadSchema>,
  metadata: CommandMetadata,
): Command {
  return {
    id: uuidv4(),
    type: AgentCommandTypes.ASSIGN_TASK,
    payload,
    metadata,
  };
}

export function createCompleteTaskCommand(
  payload: z.infer<typeof CompleteTaskPayloadSchema>,
  metadata: CommandMetadata,
): Command {
  return {
    id: uuidv4(),
    type: AgentCommandTypes.COMPLETE_TASK,
    payload,
    metadata,
  };
}

// Type exports
export type CreateAgentPayload = z.infer<typeof CreateAgentPayloadSchema>;
export type UpdateAgentPayload = z.infer<typeof UpdateAgentPayloadSchema>;
export type AssignTaskPayload = z.infer<typeof AssignTaskPayloadSchema>;
export type CompleteTaskPayload = z.infer<typeof CompleteTaskPayloadSchema>;
