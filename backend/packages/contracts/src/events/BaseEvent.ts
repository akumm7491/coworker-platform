export interface IEvent {
  readonly eventType: string;
  readonly aggregateId: string;
  readonly timestamp: Date;
  readonly version: number;
}

export abstract class BaseEvent implements IEvent {
  public readonly timestamp: Date;

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly version: number = 1
  ) {
    this.timestamp = new Date();
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      version: this.version,
      timestamp: this.timestamp,
      ...this,
    };
  }
}

// Example integration event
export class EntityCreatedEvent extends BaseEvent {
  constructor(
    aggregateId: string,
    public readonly entityType: string,
    public readonly data: Record<string, unknown>
  ) {
    super('EntityCreated', aggregateId);
  }
}
