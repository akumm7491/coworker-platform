import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700513600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL UNIQUE,
        password VARCHAR NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        reset_password_token VARCHAR,
        reset_password_expires TIMESTAMP,
        google_id VARCHAR,
        github_id VARCHAR,
        provider VARCHAR DEFAULT 'local',
        preferences JSONB DEFAULT '{"theme": "light", "language": "en", "timezone": "UTC", "notifications": {"push": true, "email": true, "desktop": true}}'::jsonb,
        activity JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1
      );
    `);

    // Create projects table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        description TEXT,
        status VARCHAR NOT NULL DEFAULT 'not_started',
        completion FLOAT DEFAULT 0,
        agents_assigned TEXT[],
        "ownerId" UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );
    `);

    // Create agents table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        description TEXT,
        status VARCHAR NOT NULL DEFAULT 'idle',
        type VARCHAR NOT NULL,
        scope VARCHAR NOT NULL,
        "ownerId" UUID NOT NULL REFERENCES users(id),
        capabilities JSONB NOT NULL,
        settings JSONB NOT NULL,
        performance JSONB,
        current_tasks JSONB,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tasks table
    await queryRunner.query(`
      CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
      
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR NOT NULL,
        description TEXT,
        status task_status DEFAULT 'todo',
        "projectId" UUID NOT NULL REFERENCES projects(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create project_collaborators table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_collaborators (
        "projectId" UUID REFERENCES projects(id),
        "userId" UUID REFERENCES users(id),
        PRIMARY KEY ("projectId", "userId")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS project_collaborators;`);
    await queryRunner.query(`DROP TABLE IF EXISTS tasks;`);
    await queryRunner.query(`DROP TYPE IF EXISTS task_status;`);
    await queryRunner.query(`DROP TABLE IF EXISTS agents;`);
    await queryRunner.query(`DROP TABLE IF EXISTS projects;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
