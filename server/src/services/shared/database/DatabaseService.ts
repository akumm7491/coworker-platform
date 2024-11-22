import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import logger from '../../../utils/logger.js';

// Import entities
import { Agent } from './entities/Agent.js';
import { Task } from './entities/Task.js';
import { Team } from './entities/Team.js';
import { KnowledgeItem } from './entities/KnowledgeItem.js';
import { Role } from './entities/Role.js';
import { Permission } from './entities/Permission.js';
import { User } from './entities/User.js';
import { TaskExecution } from './entities/TaskExecution.js';
import { TaskArtifact } from './entities/TaskArtifact.js';

export class DatabaseService {
  private static instance: DatabaseService;
  private dataSource: DataSource;

  private constructor() {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'coworker_platform',
      entities: [
        Agent,
        Task,
        Team,
        KnowledgeItem,
        Role,
        Permission,
        User,
        TaskExecution,
        TaskArtifact,
      ],
      migrations: ['src/services/shared/database/migrations/*.ts'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      namingStrategy: new SnakeNamingStrategy(),
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.dataSource.initialize();
      logger.info('Database connection initialized');

      // Run migrations in production
      if (process.env.NODE_ENV === 'production') {
        await this.dataSource.runMigrations();
        logger.info('Database migrations completed');
      }
    } catch (error) {
      logger.error('Error initializing database connection:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      logger.info('Database connection closed');
    }
  }

  getRepository<T>(entity: any) {
    return this.dataSource.getRepository<T>(entity);
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  async transaction<T>(runInTransaction: (entityManager: any) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(runInTransaction);
  }
}

export const databaseService = DatabaseService.getInstance();
