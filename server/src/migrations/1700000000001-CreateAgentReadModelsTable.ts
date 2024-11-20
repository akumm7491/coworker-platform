import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgentReadModelsTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE agent_read_models (
        id VARCHAR PRIMARY KEY,
        version INTEGER NOT NULL,
        name VARCHAR NOT NULL,
        status VARCHAR NOT NULL,
        capabilities TEXT[] NOT NULL DEFAULT '{}',
        current_tasks TEXT[] NOT NULL DEFAULT '{}',
        last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
        last_processed_position BIGINT
      );

      CREATE INDEX idx_agent_read_models_status ON agent_read_models(status);
      CREATE INDEX idx_agent_read_models_capabilities ON agent_read_models USING GIN(capabilities);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE agent_read_models;
    `);
  }
}
