import { Pool, PoolClient, PoolConfig } from 'pg';
import { Event, EventStore, EventStoreOptions } from './types.js';
import { retry } from '../utils/retry.js';
import { ConcurrencyError } from '../errors/ConcurrencyError.js';
import { Logger } from 'winston';

export class PostgresEventStore implements EventStore {
  private pool: Pool;
  private readonly options: Required<EventStoreOptions>;

  constructor(
    connectionConfig: PoolConfig,
    options: EventStoreOptions = {},
    private readonly logger: Logger,
  ) {
    this.pool = new Pool(connectionConfig);
    this.options = {
      batchSize: options.batchSize || 1000,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 100,
    };
  }

  async append(events: Event[], expectedVersion?: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      if (expectedVersion !== undefined) {
        await this.checkVersion(client, events[0].aggregateId, expectedVersion);
      }

      for (const event of events) {
        await this.appendEvent(client, event);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof ConcurrencyError) {
        throw error;
      }
      this.logger.error('Failed to append events', { error });
      throw new Error('Failed to append events');
    } finally {
      client.release();
    }
  }

  async getEvents(aggregateId: string, fromVersion?: number): Promise<Event[]> {
    const query = `
      SELECT * FROM events
      WHERE aggregate_id = $1
      ${fromVersion ? 'AND version > $2' : ''}
      ORDER BY version ASC
    `;
    const values = fromVersion ? [aggregateId, fromVersion] : [aggregateId];

    return retry(
      async () => {
        const { rows } = await this.pool.query(query, values);
        return rows.map(this.mapEventFromDb);
      },
      this.options.retryAttempts,
      this.options.retryDelay,
    );
  }

  async getAllEvents(fromPosition?: number): Promise<Event[]> {
    const query = `
      SELECT * FROM events
      ${fromPosition ? 'WHERE position > $1' : ''}
      ORDER BY position ASC
      LIMIT $${fromPosition ? '2' : '1'}
    `;
    const values = fromPosition ? [fromPosition, this.options.batchSize] : [this.options.batchSize];

    return retry(
      async () => {
        const { rows } = await this.pool.query(query, values);
        return rows.map(this.mapEventFromDb);
      },
      this.options.retryAttempts,
      this.options.retryDelay,
    );
  }

  async getEventsByType(eventType: string, fromPosition?: number): Promise<Event[]> {
    const query = `
      SELECT * FROM events
      WHERE type = $1
      ${fromPosition ? 'AND position > $2' : ''}
      ORDER BY position ASC
      LIMIT $${fromPosition ? '3' : '2'}
    `;
    const values = fromPosition
      ? [eventType, fromPosition, this.options.batchSize]
      : [eventType, this.options.batchSize];

    return retry(
      async () => {
        const { rows } = await this.pool.query(query, values);
        return rows.map(this.mapEventFromDb);
      },
      this.options.retryAttempts,
      this.options.retryDelay,
    );
  }

  async getLastPosition(): Promise<number> {
    const query = 'SELECT MAX(position) as last_position FROM events';
    const { rows } = await this.pool.query(query);
    return rows[0].last_position || 0;
  }

  private async checkVersion(
    client: PoolClient,
    aggregateId: string,
    expectedVersion: number,
  ): Promise<void> {
    const query = `
      SELECT MAX(version) as current_version
      FROM events
      WHERE aggregate_id = $1
    `;
    const { rows } = await client.query(query, [aggregateId]);
    const currentVersion = rows[0].current_version || 0;

    if (currentVersion !== expectedVersion) {
      throw new ConcurrencyError(
        `Expected version ${expectedVersion}, but current version is ${currentVersion}`,
      );
    }
  }

  private async appendEvent(client: PoolClient, event: Event): Promise<void> {
    const query = `
      INSERT INTO events (
        id,
        type,
        aggregate_id,
        aggregate_type,
        version,
        payload,
        metadata,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING position
    `;

    const values = [
      event.id,
      event.type,
      event.aggregateId,
      event.aggregateType,
      event.metadata.version,
      event.payload,
      event.metadata,
      event.metadata.timestamp,
    ];

    const { rows } = await client.query(query, values);
    event.position = rows[0].position;
  }

  private mapEventFromDb(row: any): Event {
    return {
      id: row.id,
      type: row.type,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      metadata: row.metadata,
      payload: row.payload,
      position: row.position,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
