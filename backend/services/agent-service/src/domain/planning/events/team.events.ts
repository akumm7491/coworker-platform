import { EventData } from '@coworker/shared/events/definitions/DomainEvent';
import { TeamStatus } from '@coworker/shared/types/agent';

export enum TeamEventTypes {
  STATUS_UPDATED = 'TeamStatusUpdated',
  MEMBER_ADDED = 'TeamMemberAdded',
  MEMBER_REMOVED = 'TeamMemberRemoved',
  CAPABILITIES_UPDATED = 'TeamCapabilitiesUpdated',
  METADATA_UPDATED = 'TeamMetadataUpdated',
  DESCRIPTION_UPDATED = 'TeamDescriptionUpdated',
}

// Event Data Interfaces
export interface TeamStatusEventData extends EventData {
  status: TeamStatus;
}

export interface TeamMemberEventData extends EventData {
  agentId: string;
}

export interface TeamCapabilitiesEventData extends EventData {
  capabilities: {
    [key: string]: number;
  };
}

export interface TeamMetadataEventData extends EventData {
  metadata: Record<string, unknown>;
}

export interface TeamDescriptionEventData extends EventData {
  description: string;
}

// Type Guards
export function isTeamStatusEventData(data: unknown): data is TeamStatusEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    typeof (data as TeamStatusEventData).status === 'string'
  );
}

export function isTeamMemberEventData(data: unknown): data is TeamMemberEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'agentId' in data &&
    typeof (data as TeamMemberEventData).agentId === 'string'
  );
}

export function isTeamCapabilitiesEventData(data: unknown): data is TeamCapabilitiesEventData {
  if (typeof data !== 'object' || data === null || !('capabilities' in data)) {
    return false;
  }

  const capabilities = (data as TeamCapabilitiesEventData).capabilities;
  if (typeof capabilities !== 'object' || capabilities === null) {
    return false;
  }

  return Object.entries(capabilities).every(
    ([key, value]) => typeof key === 'string' && typeof value === 'number'
  );
}

export function isTeamMetadataEventData(data: unknown): data is TeamMetadataEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'metadata' in data &&
    typeof (data as TeamMetadataEventData).metadata === 'object'
  );
}

export function isTeamDescriptionEventData(data: unknown): data is TeamDescriptionEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'description' in data &&
    typeof (data as TeamDescriptionEventData).description === 'string'
  );
}
