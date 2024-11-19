import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColumnTypes1700000000002 implements MigrationInterface {
    name = 'UpdateColumnTypes1700000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing tables if they exist
        await queryRunner.query(`DROP TABLE IF EXISTS "agent_projects" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "agents" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "projects" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "email" varchar(255) NOT NULL UNIQUE,
                "password" varchar(255) NOT NULL,
                "avatar" varchar(255),
                "emailVerificationToken" varchar(255),
                "emailVerified" boolean DEFAULT false,
                "resetPasswordToken" varchar(255),
                "resetPasswordExpires" TIMESTAMP,
                "googleId" varchar(255),
                "githubId" varchar(255),
                "provider" varchar DEFAULT 'local',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create projects table
        await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "description" text,
                "status" varchar NOT NULL DEFAULT 'not_started',
                "completion" float DEFAULT 0,
                "agents_assigned" text[],
                "ownerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_project_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id")
            )
        `);

        // Create agents table
        await queryRunner.query(`
            CREATE TABLE "agents" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "description" text,
                "status" varchar NOT NULL DEFAULT 'idle',
                "type" varchar NOT NULL DEFAULT 'general',
                "scope" varchar NOT NULL DEFAULT 'project',
                "ownerId" uuid NOT NULL,
                "capabilities" jsonb NOT NULL DEFAULT '{"skills":[],"languages":[],"tools":[],"apis":[],"permissions":[],"concurrency":{"maxProjects":5,"maxTasksPerProject":10}}',
                "settings" jsonb NOT NULL DEFAULT '{"maxConcurrentTasks":5,"timeout":300000,"retryAttempts":3,"priority":1,"notificationPreferences":{"email":true,"slack":false}}',
                "performance" jsonb NOT NULL DEFAULT '{"tasksCompleted":0,"successRate":0,"averageResponseTime":0,"lastNTasks":[],"projectMetrics":{},"metrics":{}}',
                "currentTasks" jsonb NOT NULL DEFAULT '[]',
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_agent_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id")
            )
        `);

        // Create agent_projects junction table
        await queryRunner.query(`
            CREATE TABLE "agent_projects" (
                "agentId" uuid NOT NULL,
                "projectId" uuid NOT NULL,
                PRIMARY KEY ("agentId", "projectId"),
                CONSTRAINT "fk_agent" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_project" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "agent_projects" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "agents" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "projects" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    }
}
