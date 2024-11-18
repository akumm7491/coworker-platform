import { DataSource } from 'typeorm';
import { config } from './src/config/env.js';

const dataSource = new DataSource({
  type: 'postgres',
  url: config.postgres.url,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/models/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});

export default dataSource;
