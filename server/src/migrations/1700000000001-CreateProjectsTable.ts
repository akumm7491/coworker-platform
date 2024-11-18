import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProjectsTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'archived', 'deleted'],
            default: "'active'",
          },
          {
            name: 'visibility',
            type: 'enum',
            enum: ['public', 'private', 'team'],
            default: "'private'",
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: '{}',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: '{}',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        name: 'FK_PROJECTS_USER',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create user_id index
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_USER_ID',
        columnNames: ['user_id'],
        isUnique: false,
      }),
    );

    // Create status index
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_STATUS',
        columnNames: ['status'],
        isUnique: false,
      }),
    );

    // Create visibility index
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_VISIBILITY',
        columnNames: ['visibility'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('projects', 'IDX_PROJECTS_VISIBILITY');
    await queryRunner.dropIndex('projects', 'IDX_PROJECTS_STATUS');
    await queryRunner.dropIndex('projects', 'IDX_PROJECTS_USER_ID');
    await queryRunner.dropForeignKey('projects', 'FK_PROJECTS_USER');
    await queryRunner.dropTable('projects');
  }
}
