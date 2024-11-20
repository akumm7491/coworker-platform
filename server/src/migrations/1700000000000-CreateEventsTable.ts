import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE events (
        position BIGSERIAL PRIMARY KEY,
        id UUID NOT NULL,
        type VARCHAR(255) NOT NULL,
        aggregate_id UUID NOT NULL,
        aggregate_type VARCHAR(255) NOT NULL,
        version INTEGER NOT NULL,
        payload JSONB NOT NULL,
        metadata JSONB NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Indexes for efficient querying
      CREATE INDEX idx_events_aggregate_id ON events(aggregate_id);
      CREATE INDEX idx_events_type ON events(type);
      CREATE INDEX idx_events_timestamp ON events(timestamp);
      CREATE INDEX idx_events_aggregate_type ON events(aggregate_type);
      
      -- Composite indexes for common query patterns
      CREATE INDEX idx_events_aggregate_version ON events(aggregate_id, version);
      CREATE INDEX idx_events_type_position ON events(type, position);

      -- Constraints
      ALTER TABLE events ADD CONSTRAINT uk_events_id UNIQUE (id);
      ALTER TABLE events ADD CONSTRAINT uk_events_aggregate_version 
        UNIQUE (aggregate_id, version);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS events CASCADE;
    `);
  }
}
