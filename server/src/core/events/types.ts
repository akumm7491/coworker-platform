import { z } from 'zod';

export const EventMetadataSchema = z.object({
  userId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  timestamp: z.date(),
  version: z.number().int().positive(),
});

export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  aggregateId: z.string().uuid(),
  aggregateType: z.string(),
  metadata: EventMetadataSchema,
  payload: z.unknown(),
});

export type EventMetadata = z.infer<typeof EventMetadataSchema>;
export type BaseEvent = z.infer<typeof BaseEventSchema>;

export interface Event extends BaseEvent {
  position?: number; // For event store position tracking
}

export interface EventStoreOptions {
  batchSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface EventStore {
  append(events: Event[], expectedVersion?: number): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<Event[]>;
  getAllEvents(fromPosition?: number): Promise<Event[]>;
  getEventsByType(eventType: string, fromPosition?: number): Promise<Event[]>;
  getLastPosition(): Promise<number>;
}
