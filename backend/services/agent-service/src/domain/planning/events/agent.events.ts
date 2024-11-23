import { EventData } from '@coworker/shared/events/definitions/DomainEvent';
import {
  AgentStatus,
  AgentRole,
  AgentPerformance,
  AgentLearningModel,
  AgentWorkingMemory,
  AgentCommunication,
} from '@coworker/shared/types/agent';

export enum AgentEventTypes {
  STATUS_UPDATED = 'AgentStatusUpdated',
  ROLE_UPDATED = 'AgentRoleUpdated',
  CAPABILITIES_UPDATED = 'AgentCapabilitiesUpdated',
  PERFORMANCE_METRICS_UPDATED = 'AgentPerformanceMetricsUpdated',
  LEARNING_MODEL_UPDATED = 'AgentLearningModelUpdated',
  WORKING_MEMORY_UPDATED = 'AgentWorkingMemoryUpdated',
  COMMUNICATION_UPDATED = 'AgentCommunicationUpdated',
  METADATA_UPDATED = 'AgentMetadataUpdated',
  DESCRIPTION_UPDATED = 'AgentDescriptionUpdated',
}

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

export interface AgentPerformanceMetricsEventData extends EventData {
  performance_metrics: AgentPerformance;
}

export interface AgentLearningModelEventData extends EventData {
  learning_model: AgentLearningModel;
}

export interface AgentWorkingMemoryEventData extends EventData {
  working_memory: AgentWorkingMemory;
}

export interface AgentCommunicationEventData extends EventData {
  communication: AgentCommunication;
}

export interface AgentMetadataEventData extends EventData {
  metadata: Record<string, unknown>;
}

export interface AgentDescriptionEventData extends EventData {
  description: string;
}

// Type Guards
export function isAgentStatusEventData(data: unknown): data is AgentStatusEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    typeof (data as AgentStatusEventData).status === 'string'
  );
}

export function isAgentRoleEventData(data: unknown): data is AgentRoleEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'role' in data &&
    typeof (data as AgentRoleEventData).role === 'string'
  );
}

export function isAgentCapabilitiesEventData(data: unknown): data is AgentCapabilitiesEventData {
  if (typeof data !== 'object' || data === null || !('capabilities' in data)) {
    return false;
  }

  const capabilities = (data as AgentCapabilitiesEventData).capabilities;
  return Array.isArray(capabilities) && capabilities.every(cap => typeof cap === 'string');
}

export function isAgentPerformanceMetricsEventData(
  data: unknown
): data is AgentPerformanceMetricsEventData {
  if (typeof data !== 'object' || data === null || !('performance_metrics' in data)) {
    return false;
  }

  const metrics = (data as AgentPerformanceMetricsEventData).performance_metrics;
  return (
    typeof metrics === 'object' &&
    metrics !== null &&
    'tasks_completed' in metrics &&
    'avg_completion_time' in metrics &&
    'success_rate' in metrics &&
    'quality_score' in metrics &&
    'collaboration_score' in metrics
  );
}

export function isAgentLearningModelEventData(data: unknown): data is AgentLearningModelEventData {
  if (typeof data !== 'object' || data === null || !('learning_model' in data)) {
    return false;
  }

  const model = (data as AgentLearningModelEventData).learning_model;
  return (
    typeof model === 'object' &&
    model !== null &&
    'model_type' in model &&
    'parameters' in model &&
    'training_data' in model &&
    'version' in model
  );
}

export function isAgentWorkingMemoryEventData(data: unknown): data is AgentWorkingMemoryEventData {
  if (typeof data !== 'object' || data === null || !('working_memory' in data)) {
    return false;
  }

  const memory = (data as AgentWorkingMemoryEventData).working_memory;
  return (
    typeof memory === 'object' &&
    memory !== null &&
    'context' in memory &&
    'short_term' in memory &&
    'long_term' in memory
  );
}

export function isAgentCommunicationEventData(data: unknown): data is AgentCommunicationEventData {
  if (typeof data !== 'object' || data === null || !('communication' in data)) {
    return false;
  }

  const comm = (data as AgentCommunicationEventData).communication;
  return (
    typeof comm === 'object' &&
    comm !== null &&
    'style' in comm &&
    'preferences' in comm &&
    'history' in comm
  );
}

export function isAgentMetadataEventData(data: unknown): data is AgentMetadataEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'metadata' in data &&
    typeof (data as AgentMetadataEventData).metadata === 'object'
  );
}

export function isAgentDescriptionEventData(data: unknown): data is AgentDescriptionEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'description' in data &&
    typeof (data as AgentDescriptionEventData).description === 'string'
  );
}
