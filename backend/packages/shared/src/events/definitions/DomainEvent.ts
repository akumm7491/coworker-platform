import { UserEventTypes } from '../../database/entities/User';
import { ProjectEventTypes } from '../../database/entities/Project';
import { AgentEventTypes } from '../../database/entities/Agent';
import { TaskEventTypes } from '../../database/entities/Task';
import { TeamEventTypes } from '../../database/entities/Team';

export type EventType =
  | UserEventTypes
  | ProjectEventTypes
  | AgentEventTypes
  | TaskEventTypes
  | TeamEventTypes;

export interface BaseEventData {
  timestamp?: Date;
}

export interface EventData extends BaseEventData {
  [key: string]: unknown;
}

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventType: EventType;
  public readonly aggregateId: string;
  public readonly version: number;
  public readonly data: EventData;

  constructor(eventType: EventType, aggregateId: string, version: number, data: EventData) {
    this.eventType = eventType;
    this.aggregateId = aggregateId;
    this.version = version;
    this.data = {
      ...data,
      timestamp: new Date()
    };
    this.occurredOn = new Date();
  }

  abstract toJSON(): Record<string, unknown>;
}
