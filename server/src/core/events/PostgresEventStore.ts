import pkg from 'pg';
const { Pool } = pkg;
import type { PoolConfig, Pool as PgPool } from 'pg';
import { Event, EventStore, EventStoreOptions } from './types.js';
import { ConcurrencyError } from '../errors/ConcurrencyError.js';
import { Logger } from 'winston';

export class PostgresEventStore implements EventStore {
  private pool: PgPool;
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

  async initialize(): Promise<void> {
    try {
      // Test the connection
      const client = await this.pool.connect();
      await client.release();
      this.logger.info('PostgresEventStore initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PostgresEventStore', { error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.info('PostgresEventStore shut down successfully');
    } catch (error) {
      this.logger.error('Error shutting down PostgresEventStore', { error });
      throw error;
    }
  }

  async appendToStream(streamId: string, expectedVersion: number, events: Event[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const currentVersionResult = await client.query(
        'SELECT version FROM event_streams WHERE stream_id = $1 FOR UPDATE',
        [streamId],
      );

      let currentVersion = -1;
      if (currentVersionResult.rows.length > 0) {
        currentVersion = currentVersionResult.rows[0].version;
      }

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(`Expected version ${expectedVersion} but got ${currentVersion}`);
      }

      const newVersion = currentVersion + events.length;

      // Update or insert the stream version
      await client.query(
        `
        INSERT INTO event_streams (stream_id, version)
        VALUES ($1, $2)
        ON CONFLICT (stream_id)
        DO UPDATE SET version = $2
        `,
        [streamId, newVersion],
      );

      // Insert events
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const version = currentVersion + i + 1;
        await client.query(
          `
          INSERT INTO events (
            stream_id,
            version,
            type,
            data,
            metadata,
            timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [streamId, version, event.type, event.payload, event.metadata, event.metadata?.timestamp],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      await client.release();
    }
  }

  async append(events: Event[], expectedVersion?: number): Promise<void> {
    if (events.length === 0) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const event of events) {
        await this.appendToStream(event.aggregateId, expectedVersion ?? -1, [event]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getEvents(aggregateId: string, fromVersion = 0): Promise<Event[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM events 
        WHERE aggregate_id = $1 AND version >= $2 
        ORDER BY version ASC
      `;
      const result = await client.query(query, [aggregateId, fromVersion]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getAllEvents(fromPosition = 0): Promise<Event[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM events 
        WHERE position >= $1 
        ORDER BY position ASC
      `;
      const result = await client.query(query, [fromPosition]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getEventsByType(eventType: string, fromPosition = 0): Promise<Event[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM events 
        WHERE type = $1 AND position >= $2 
        ORDER BY position ASC
      `;
      const result = await client.query(query, [eventType, fromPosition]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getLastPosition(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT COALESCE(MAX(position), 0) as last_position 
        FROM events
      `;
      const result = await client.query(query);
      return result.rows[0].last_position;
    } finally {
      client.release();
    }
  }

  async readFromStream(
    streamId: string,
    fromVersion?: number,
    toVersion?: number,
  ): Promise<Event[]> {
    let query = 'SELECT * FROM events WHERE stream_id = $1';
    const params: any[] = [streamId];

    if (fromVersion !== undefined) {
      query += ' AND version >= $2';
      params.push(fromVersion);
    }

    if (toVersion !== undefined) {
      query += ` AND version <= $${params.length + 1}`;
      params.push(toVersion);
    }

    query += ' ORDER BY version ASC';

    const result = await this.pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id,
      streamId: row.stream_id,
      version: row.version,
      type: row.type,
      data: row.data,
      metadata: row.metadata,
      timestamp: row.timestamp,
    }));
  }

  async readAllEvents(
    fromPosition?: number,
    batchSize: number = this.options.batchSize,
  ): Promise<Event[]> {
    const query = fromPosition
      ? 'SELECT * FROM events WHERE id > $1 ORDER BY id ASC LIMIT $2'
      : 'SELECT * FROM events ORDER BY id ASC LIMIT $1';

    const params = fromPosition ? [fromPosition, batchSize] : [batchSize];

    const result = await this.pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id,
      streamId: row.stream_id,
      version: row.version,
      type: row.type,
      data: row.data,
      metadata: row.metadata,
      timestamp: row.timestamp,
    }));
  }
}
