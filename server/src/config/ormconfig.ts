import { DataSource } from 'typeorm';
import { config } from './env.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Agent } from '../models/Agent.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Project, Agent],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
