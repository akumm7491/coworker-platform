import { DataSource } from 'typeorm';
import logger from '../utils/logger.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Agent } from '../models/Agent.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  entities: [User, Project, Agent],
  migrations: ['src/migrations/*.ts'],
  synchronize: true, // Temporarily enable synchronize to create tables
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection initialized');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

// Export repositories
export const UserRepository = AppDataSource.getRepository(User);
export const ProjectRepository = AppDataSource.getRepository(Project);
export const AgentRepository = AppDataSource.getRepository(Agent);
