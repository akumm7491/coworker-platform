import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupTasksWithoutProject1700513700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, delete any tasks that don't have a projectId
    await queryRunner.query(`
      DELETE FROM tasks
      WHERE "projectId" IS NULL;
    `);

    // Then make the projectId column non-nullable
    await queryRunner.query(`
      ALTER TABLE tasks
      ALTER COLUMN "projectId" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Make the projectId column nullable again
    await queryRunner.query(`
      ALTER TABLE tasks
      ALTER COLUMN "projectId" DROP NOT NULL;
    `);
  }
}
