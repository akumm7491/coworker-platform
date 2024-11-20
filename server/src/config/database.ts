import { DataSource } from 'typeorm';
import logger from '../utils/logger.js';

// Import models
const User = await import('../models/User.js').then(m => m.User);
const Project = await import('../models/Project.js').then(m => m.Project);
const Agent = await import('../models/Agent.js').then(m => m.Agent);
const Task = await import('../models/Task.js').then(m => m.Task);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  entities: [User, Project, Agent, Task],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Disable synchronize to use migrations instead
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations(); // Run migrations after initialization
    logger.info('Database connection initialized and migrations applied');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

// Export repositories
export const UserRepository = AppDataSource.getRepository(User);
export const ProjectRepository = AppDataSource.getRepository(Project);
export const AgentRepository = AppDataSource.getRepository(Agent);
export const TaskRepository = AppDataSource.getRepository(Task);
