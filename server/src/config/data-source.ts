import { DataSource } from 'typeorm';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Agent } from '../models/Agent.js';
import { Task } from '../models/Task.js';
import { InitialSchema1700513600000 } from '../migrations/1700513600000-InitialSchema.js';
import { CleanupTasksWithoutProject1700513700000 } from '../migrations/1700513700000-CleanupTasksWithoutProject.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5432/coworker',
  entities: [User, Project, Agent, Task],
  migrations: [InitialSchema1700513600000, CleanupTasksWithoutProject1700513700000],
  synchronize: false,
  logging: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
