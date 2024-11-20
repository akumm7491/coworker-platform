import { Pool } from 'pg';
import { Logger } from 'winston';
import { ReadModel, ReadModelRepository } from './types.js';
import { retry } from '../utils/retry.js';

// Define a type for database rows
export type DatabaseRow = Record<string, unknown>;

export abstract class PostgresReadModelRepository<T extends ReadModel>
  implements ReadModelRepository<T>
{
  constructor(
    protected readonly pool: Pool,
    protected readonly tableName: string,
    protected readonly logger: Logger,
  ) {}

  abstract mapToModel(row: DatabaseRow): T;
  abstract mapToRow(model: T): DatabaseRow;

  async save(model: T): Promise<void> {
    const row = this.mapToRow(model);
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const updateSet = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (id) DO UPDATE SET ${updateSet}
    `;

    try {
      await retry(
        async () => {
          await this.pool.query(query, values);
        },
        3,
        1000,
      );
    } catch (error) {
      this.logger.error('Error saving read model', {
        modelId: model.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async findById(id: string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;

    try {
      const { rows } = await this.pool.query(query, [id]);
      return rows.length > 0 ? this.mapToModel(rows[0]) : null;
    } catch (error) {
      this.logger.error('Error finding read model by id', {
        modelId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async findAll(): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName}`;

    try {
      const { rows } = await this.pool.query(query);
      return rows.map(row => this.mapToModel(row));
    } catch (error) {
      this.logger.error('Error finding all read models', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;

    try {
      await this.pool.query(query, [id]);
    } catch (error) {
      this.logger.error('Error deleting read model', {
        modelId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
