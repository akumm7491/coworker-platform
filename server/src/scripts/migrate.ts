import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Table to track migrations
const createMigrationsTable = `
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

async function getMigrationsDir() {
  return path.join(process.cwd(), 'migrations');
}

async function getAppliedMigrations(): Promise<string[]> {
  const result = await pool.query(
    'SELECT name FROM migrations ORDER BY id ASC'
  );
  return result.rows.map(row => row.name);
}

async function markMigrationAsApplied(name: string) {
  await pool.query(
    'INSERT INTO migrations (name) VALUES ($1)',
    [name]
  );
}

async function migrate() {
  const client = await pool.connect();
  
  try {
    // Create migrations table if it doesn't exist
    await client.query(createMigrationsTable);
    
    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations();
    
    // Get all migration files
    const migrationsDir = await getMigrationsDir();
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();
    
    // Apply new migrations
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        console.log(`Applying migration: ${file}`);
        
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf-8');
        
        await client.query('BEGIN');
        
        try {
          await client.query(sql);
          await markMigrationAsApplied(file);
          await client.query('COMMIT');
          console.log(`Successfully applied migration: ${file}`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error);
          throw error;
        }
      }
    }
    
    console.log('All migrations applied successfully');
  } finally {
    client.release();
  }
}

// Run migrations
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
