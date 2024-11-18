import { DataSource } from 'typeorm';
import { config } from './env.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { CreateUsersTable1700000000000 } from '../migrations/1700000000000-CreateUsersTable.js';
import { CreateProjectsTable1700000000001 } from '../migrations/1700000000001-CreateProjectsTable.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Project],
  migrations: [CreateUsersTable1700000000000, CreateProjectsTable1700000000001],
  subscribers: [],
});

export default AppDataSource;
