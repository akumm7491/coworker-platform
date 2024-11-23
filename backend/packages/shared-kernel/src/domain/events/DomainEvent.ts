export interface IDomainEvent {
  readonly eventType: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly version: number;
}

export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly version: number = 1
  ) {
    this.occurredOn = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      version: this.version,
      occurredOn: this.occurredOn,
    };
  }
}
