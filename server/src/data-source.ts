import { DataSource } from 'typeorm';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { Agent } from './models/Agent.js';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  entities: [User, Project, Agent],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
