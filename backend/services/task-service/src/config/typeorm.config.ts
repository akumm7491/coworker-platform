import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Task } from '../domain/models/Task';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  host: process.env.NODE_ENV === 'test' ? 'localhost' : (process.env.DB_HOST || 'postgres'),
  port: process.env.NODE_ENV === 'test' ? 5434 : parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.NODE_ENV === 'test' ? 'task_service_test' : (process.env.DB_NAME || 'taskdb'),
  entities: [Task],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};
