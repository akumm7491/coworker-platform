import { Pool } from 'pg';
import { Logger } from 'winston';
import { PostgresReadModelRepository, DatabaseRow } from './PostgresReadModelRepository.js';
import { AgentReadModel } from './AgentReadModel.js';

export class AgentReadModelRepository extends PostgresReadModelRepository<AgentReadModel> {
  constructor(pool: Pool, logger: Logger) {
    super(pool, 'agent_read_models', logger);
  }

  mapToModel(row: DatabaseRow): AgentReadModel {
    return {
      id: String(row.id),
      version: Number(row.version),
      name: String(row.name),
      status: String(row.status) as AgentReadModel['status'],
      capabilities: Array.isArray(row.capabilities) ? row.capabilities.map(String) : [],
      currentTasks: Array.isArray(row.current_tasks) ? row.current_tasks.map(String) : [],
      lastUpdated: new Date(String(row.last_updated)),
      lastProcessedPosition: row.last_processed_position
        ? Number(row.last_processed_position)
        : undefined,
    };
  }

  mapToRow(model: AgentReadModel): DatabaseRow {
    return {
      id: model.id,
      version: model.version,
      name: model.name,
      status: model.status,
      capabilities: model.capabilities,
      current_tasks: model.currentTasks,
      last_updated: model.lastUpdated.toISOString(),
      last_processed_position: model.lastProcessedPosition,
    };
  }

  async findByCapability(capability: string): Promise<AgentReadModel[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE capabilities @> ARRAY[$1]::text[]
      AND status = 'IDLE'
    `;

    try {
      const { rows } = await this.pool.query(query, [capability]);
      return rows.map(row => this.mapToModel(row));
    } catch (error) {
      this.logger.error('Error finding agents by capability', {
        capability,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async findAvailableAgents(): Promise<AgentReadModel[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE status = 'IDLE'
    `;

    try {
      const { rows } = await this.pool.query(query);
      return rows.map(row => this.mapToModel(row));
    } catch (error) {
      this.logger.error('Error finding available agents', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
