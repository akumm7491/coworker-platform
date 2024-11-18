import { Client } from 'pg';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('migrate');

async function connectToDatabase(): Promise<Client> {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    logger.info('Connected to database');
    return client;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

async function getMigrations(client: Client): Promise<string[]> {
  const result = await client.query('SELECT name FROM migrations ORDER BY id ASC');
  return result.rows.map(row => row.name);
}

async function recordMigration(client: Client, name: string): Promise<void> {
  await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

async function runMigration(client: Client, name: string): Promise<void> {
  const migrationFile = await import(`../migrations/${name}`);
  const { up } = migrationFile;

  if (typeof up !== 'function') {
    throw new Error(`Migration ${name} does not export an 'up' function`);
  }

  try {
    await client.query('BEGIN');
    await up(client);
    await recordMigration(client, name);
    await client.query('COMMIT');
    logger.info(`Successfully ran migration: ${name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`Failed to run migration ${name}:`, error);
    throw error;
  }
}

async function main(): Promise<void> {
  const client = await connectToDatabase();

  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of completed migrations
    const completedMigrations = await getMigrations(client);

    // Get list of migration files
    const migrationFiles = await import('../migrations/index');
    const pendingMigrations = migrationFiles.default.filter(
      name => !completedMigrations.includes(name),
    );

    // Run pending migrations
    for (const migration of pendingMigrations) {
      await runMigration(client, migration);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
main();
