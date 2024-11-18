import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'email',
            type: 'varchar',
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'provider',
            type: 'enum',
            enum: ['local', 'google', 'github'],
            default: "'local'",
          },
          {
            name: 'avatar',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'google_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'github_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'two_factor_enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'two_factor_secret',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reset_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reset_token_expires',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_login',
            type: 'timestamp',
            isNullable: true,
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

    // Create email index
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    // Create google_id index
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_GOOGLE_ID',
        columnNames: ['google_id'],
        isUnique: true,
        where: 'google_id IS NOT NULL',
      }),
    );

    // Create github_id index
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_GITHUB_ID',
        columnNames: ['github_id'],
        isUnique: true,
        where: 'github_id IS NOT NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USERS_GITHUB_ID');
    await queryRunner.dropIndex('users', 'IDX_USERS_GOOGLE_ID');
    await queryRunner.dropIndex('users', 'IDX_USERS_EMAIL');
    await queryRunner.dropTable('users');
  }
}
