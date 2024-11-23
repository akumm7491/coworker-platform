import { EventData } from '@coworker/shared/events/definitions/DomainEvent';
import { ProjectStatus } from '@coworker/shared/types/agent';

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
    theme: {
      light: Record<string, string>;
      dark: Record<string, string>;
    };
    typography: {
      fonts: Record<string, string>;
      sizes: Record<string, string>;
    };
    spacing: Record<string, string>;
    radius: Record<string, string>;
    icons: Record<string, string>;
  };
}

export interface ProjectIntegrationEventData extends EventData {
  integration: {
    type: string;
    enabled: boolean;
    config: Record<string, unknown>;
  };
}

export interface ProjectAnalyticsEventData extends EventData {
  analytics: {
    agent_performance: Record<string, unknown>;
    task_completion: Record<string, unknown>;
    timeline: Array<{
      timestamp: string;
      event: string;
      details: Record<string, unknown>;
    }>;
    metrics: Record<string, number>;
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

export enum ProjectEventTypes {
  REQUIREMENTS_UPDATED = 'ProjectRequirementsUpdated',
  VISION_UPDATED = 'ProjectVisionUpdated',
  STATUS_UPDATED = 'ProjectStatusUpdated',
  DESIGN_SYSTEM_UPDATED = 'ProjectDesignSystemUpdated',
  INTEGRATION_UPDATED = 'ProjectIntegrationUpdated',
  ANALYTICS_UPDATED = 'ProjectAnalyticsUpdated',
  FEATURE_UPDATED = 'ProjectFeatureUpdated',
  LEAD_AGENT_UPDATED = 'ProjectLeadAgentUpdated',
  STARTED = 'ProjectStarted',
  COMPLETED = 'ProjectCompleted',
  PUT_ON_HOLD = 'ProjectPutOnHold',
  RESUMED = 'ProjectResumed',
}

// Type Guards
export function isProjectRequirementsEventData(
  data: unknown
): data is ProjectRequirementsEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'requirements' in data &&
    Array.isArray((data as ProjectRequirementsEventData).requirements)
  );
}

export function isProjectVisionEventData(data: unknown): data is ProjectVisionEventData {
  const d = data as ProjectVisionEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'vision' in d &&
    typeof d.vision === 'object' &&
    'goals' in d.vision &&
    Array.isArray(d.vision.goals) &&
    'constraints' in d.vision &&
    Array.isArray(d.vision.constraints) &&
    'success_criteria' in d.vision &&
    Array.isArray(d.vision.success_criteria)
  );
}

export function isProjectStatusEventData(data: unknown): data is ProjectStatusEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    typeof (data as ProjectStatusEventData).status === 'string'
  );
}

export function isProjectDesignSystemEventData(
  data: unknown
): data is ProjectDesignSystemEventData {
  const d = data as ProjectDesignSystemEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'designSystem' in d &&
    typeof d.designSystem === 'object' &&
    'theme' in d.designSystem &&
    typeof d.designSystem.theme === 'object' &&
    'light' in d.designSystem.theme &&
    typeof d.designSystem.theme.light === 'object' &&
    'dark' in d.designSystem.theme &&
    typeof d.designSystem.theme.dark === 'object' &&
    'typography' in d.designSystem &&
    typeof d.designSystem.typography === 'object' &&
    'fonts' in d.designSystem.typography &&
    typeof d.designSystem.typography.fonts === 'object' &&
    'sizes' in d.designSystem.typography &&
    typeof d.designSystem.typography.sizes === 'object' &&
    'spacing' in d.designSystem &&
    typeof d.designSystem.spacing === 'object' &&
    'radius' in d.designSystem &&
    typeof d.designSystem.radius === 'object' &&
    'icons' in d.designSystem &&
    typeof d.designSystem.icons === 'object'
  );
}

export function isProjectIntegrationEventData(data: unknown): data is ProjectIntegrationEventData {
  const d = data as ProjectIntegrationEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'integration' in d &&
    typeof d.integration === 'object' &&
    'type' in d.integration &&
    typeof d.integration.type === 'string' &&
    'enabled' in d.integration &&
    typeof d.integration.enabled === 'boolean' &&
    'config' in d.integration &&
    typeof d.integration.config === 'object'
  );
}

export function isProjectAnalyticsEventData(data: unknown): data is ProjectAnalyticsEventData {
  const d = data as ProjectAnalyticsEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'analytics' in d &&
    typeof d.analytics === 'object' &&
    'agent_performance' in d.analytics &&
    typeof d.analytics.agent_performance === 'object' &&
    'task_completion' in d.analytics &&
    typeof d.analytics.task_completion === 'object' &&
    'timeline' in d.analytics &&
    Array.isArray(d.analytics.timeline) &&
    'metrics' in d.analytics &&
    typeof d.analytics.metrics === 'object'
  );
}

export function isProjectFeatureEventData(data: unknown): data is ProjectFeatureEventData {
  const d = data as ProjectFeatureEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'feature' in d &&
    typeof d.feature === 'object' &&
    'name' in d.feature &&
    typeof d.feature.name === 'string' &&
    'enabled' in d.feature &&
    typeof d.feature.enabled === 'boolean'
  );
}

export function isProjectLeadAgentEventData(data: unknown): data is ProjectLeadAgentEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'agentId' in data &&
    typeof (data as ProjectLeadAgentEventData).agentId === 'string'
  );
}

export function isProjectStartedEventData(data: unknown): data is ProjectStartedEventData {
  const d = data as ProjectStartedEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'timestamp' in d &&
    d.timestamp instanceof Date &&
    'startDate' in d &&
    d.startDate instanceof Date &&
    'initialStatus' in d &&
    typeof d.initialStatus === 'string'
  );
}

export function isProjectCompletedEventData(data: unknown): data is ProjectCompletedEventData {
  const d = data as ProjectCompletedEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'timestamp' in d &&
    d.timestamp instanceof Date &&
    'completionDate' in d &&
    d.completionDate instanceof Date &&
    'finalStatus' in d &&
    typeof d.finalStatus === 'string'
  );
}

export function isProjectHoldEventData(data: unknown): data is ProjectHoldEventData {
  const d = data as ProjectHoldEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'timestamp' in d &&
    d.timestamp instanceof Date &&
    'reason' in d &&
    typeof d.reason === 'string'
  );
}

export function isProjectResumedEventData(data: unknown): data is ProjectResumedEventData {
  const d = data as ProjectResumedEventData;
  return (
    typeof data === 'object' &&
    data !== null &&
    'timestamp' in d &&
    d.timestamp instanceof Date &&
    'previousStatus' in d &&
    typeof d.previousStatus === 'string'
  );
}
