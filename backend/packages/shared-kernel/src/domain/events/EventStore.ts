import { IDomainEvent } from './DomainEvent';
import { Result } from '../../common/Result';

export class EventStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EventStoreError';
  }
}

export interface EventStream {
  aggregateId: string;
  events: IDomainEvent[];
  version: number;
}

export interface IEventStore {
  appendEvents(
    aggregateId: string,
    events: IDomainEvent[],
    expectedVersion?: number
  ): Promise<Result<void>>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<Result<EventStream>>;
  getEventsUpToVersion(aggregateId: string, toVersion: number): Promise<Result<EventStream>>;
  exists(aggregateId: string): Promise<Result<boolean>>;
}

export class InMemoryEventStore implements IEventStore {
  private readonly streams: Map<string, EventStream> = new Map();

  async appendEvents(
    aggregateId: string,
    events: IDomainEvent[],
    expectedVersion?: number
  ): Promise<Result<void>> {
    const stream = this.streams.get(aggregateId) || {
      aggregateId,
      events: [],
      version: 0,
    };

    if (expectedVersion !== undefined && stream.version !== expectedVersion) {
      return Result.fail(new EventStoreError('Concurrency conflict: unexpected version'));
    }

    stream.events.push(...events);
    stream.version += events.length;
    this.streams.set(aggregateId, stream);

    return Result.ok(undefined);
  }

  async getEvents(aggregateId: string, fromVersion = 0): Promise<Result<EventStream>> {
    const stream = this.streams.get(aggregateId);
    if (!stream) {
      return Result.fail(
        new EventStoreError(`Event stream not found for aggregate ${aggregateId}`)
      );
    }

    return Result.ok({
      ...stream,
      events: stream.events.slice(fromVersion),
    });
  }

  async getEventsUpToVersion(aggregateId: string, toVersion: number): Promise<Result<EventStream>> {
    const stream = this.streams.get(aggregateId);
    if (!stream) {
      return Result.fail(
        new EventStoreError(`Event stream not found for aggregate ${aggregateId}`)
      );
    }

    return Result.ok({
      ...stream,
      events: stream.events.slice(0, toVersion),
    });
  }

  async exists(aggregateId: string): Promise<Result<boolean>> {
    return Result.ok(this.streams.has(aggregateId));
  }
}
