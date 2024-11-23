import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Task } from '../domain/models/Task';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taskdb',
  entities: [Task],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in development
};
