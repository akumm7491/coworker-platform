export enum BaseEventType {
  // Common event types that all services might use
  CREATED = 'entity.created',
  UPDATED = 'entity.updated',
  DELETED = 'entity.deleted',
  ERROR = 'error',
}

export interface BaseEventMetadata {
  userId?: string;
  timestamp?: Date;
  correlationId?: string;
  [key: string]: unknown;
}

export interface BaseEventPayload {
  entityId?: string;
  entityType?: string;
  error?: string;
  [key: string]: unknown;
}
