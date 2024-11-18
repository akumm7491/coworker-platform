import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './src/models/User.js';
import { Project } from './src/models/Project.js';
import { CreateUsersTable1700000000000 } from './src/migrations/1700000000000-CreateUsersTable.js';
import { CreateProjectsTable1700000000001 } from './src/migrations/1700000000001-CreateProjectsTable.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5433/coworker',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Project],
  migrations: [CreateUsersTable1700000000000, CreateProjectsTable1700000000001],
  subscribers: [],
});

export default dataSource;
