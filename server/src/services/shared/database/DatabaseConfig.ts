import { DataSource, DataSourceOptions } from 'typeorm';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';

export class DatabaseConfig {
  private static instance: DataSource;
  private readonly logger: Logger = logger;

  public static async getConnection(): Promise<DataSource> {
    if (!DatabaseConfig.instance) {
      const config = new DatabaseConfig();
      DatabaseConfig.instance = await config.createConnection();
    }
    return DatabaseConfig.instance;
  }

  private async createConnection(): Promise<DataSource> {
    try {
      const config: DataSourceOptions = {
        type: process.env.DB_TYPE as 'postgres' | 'mysql' | 'mariadb',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'coworker_platform',
        entities: ['src/services/shared/database/entities/**/*.ts'],
        migrations: ['src/migrations/**/*.ts'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production',
        ssl: process.env.DB_SSL === 'true',
      };

      const dataSource = new DataSource(config);
      await dataSource.initialize();

      this.logger.info('Database connection established');
      return dataSource;
    } catch (error) {
      this.logger.error('Error connecting to database:', error);
      throw error;
    }
  }
}
