import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignProjectWithFrontend1706043600000 implements MigrationInterface {
  name = 'AlignProjectWithFrontend1706043600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_status_enum" CASCADE`);

    // Create new status enum
    await queryRunner.query(
      `CREATE TYPE "public"."projects_status_enum" AS ENUM('not_started', 'in_progress', 'completed', 'on_hold')`,
    );

    // Add agents_assigned column
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "agents_assigned" text`,
    );

    // Add completion column if it doesn't exist
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "completion" float DEFAULT 0`,
    );

    // Remove old columns that are no longer needed
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "visibility"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "settings"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "metadata"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "agentSettings"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "environment"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "analytics"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "tasks"`);

    // Rename timestamp columns
    await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "updatedAt" TO "updated_at"`);

    // Update existing status values to match new enum
    await queryRunner.query(`
            UPDATE "projects" 
            SET status = CASE 
                WHEN status = 'active' THEN 'in_progress'
                WHEN status = 'paused' THEN 'on_hold'
                WHEN status = 'archived' THEN 'completed'
                ELSE status
            END
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert timestamp column names
    await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "updated_at" TO "updatedAt"`);

    // Drop the new columns
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "agents_assigned"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "completion"`);

    // Recreate old status enum
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_status_enum" CASCADE`);
    await queryRunner.query(
      `CREATE TYPE "public"."projects_status_enum" AS ENUM('active', 'paused', 'completed', 'archived')`,
    );

    // Update status values back
    await queryRunner.query(`
            UPDATE "projects" 
            SET status = CASE 
                WHEN status = 'in_progress' THEN 'active'
                WHEN status = 'on_hold' THEN 'paused'
                ELSE status
            END
        `);
  }
}
