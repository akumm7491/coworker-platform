import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignProjectWithFrontend1706043600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing enum if it exists
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_status_enum" CASCADE`);

    // Create new enum with updated values
    await queryRunner.query(
      `CREATE TYPE "public"."projects_status_enum" AS ENUM('not_started', 'in_progress', 'completed', 'on_hold')`,
    );

    // Add status column with new enum type
    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD COLUMN IF NOT EXISTS "status" "public"."projects_status_enum" DEFAULT 'not_started'
    `);

    // Add new columns
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "agents_assigned" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "completion" float DEFAULT 0`,
    );

    // Drop unused columns
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "visibility"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "settings"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "metadata"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "agentSettings"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "environment"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "analytics"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "tasks"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new columns
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "agents_assigned"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "completion"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "status"`);

    // Drop the new enum
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_status_enum" CASCADE`);

    // Add back old columns with default values
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "visibility" VARCHAR DEFAULT 'private'`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "settings" JSONB DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "agentSettings" JSONB DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "environment" JSONB DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "analytics" JSONB DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF EXISTS "tasks" JSONB DEFAULT '[]'::jsonb`,
    );
  }
}
