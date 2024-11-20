import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5432/coworker',
  entities: [join(__dirname, '../models/*.{ts,js}')],
  migrations: [join(__dirname, '../migrations/*.{ts,js}')],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runMigrations();
