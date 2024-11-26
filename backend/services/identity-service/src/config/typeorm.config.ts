import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../domain/models/User';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  host: process.env.NODE_ENV === 'test' ? 'localhost' : process.env.DB_HOST || 'postgres',
  port: process.env.NODE_ENV === 'test' ? 5435 : parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database:
    process.env.NODE_ENV === 'test'
      ? 'identity_service_test'
      : process.env.DB_NAME || 'identity_db',
  entities: [User],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};
