import { Application } from 'express';
import request from 'supertest';
import { AppDataSource } from '../../config/database.js';
import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Agent } from '../../models/Agent.js';

export const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
  provider: 'local' as const,
};

export const testProject = {
  name: 'Test Project',
  description: 'A test project',
  status: 'in_progress',
  completion: 0,
  agents_assigned: [],
};

export const testAgent = {
  name: 'Test Agent',
  type: 'developer',
  status: 'idle',
  performance: {
    tasksCompleted: 0,
    successRate: 100,
    averageTime: 0,
  },
  capabilities: ['testing'],
  learningRate: 1.0,
  maxConcurrentTasks: 3,
  description: 'A test agent',
};

export async function createTestUser(app: Application): Promise<any> {
  const response = await request(app).post('/api/auth/register').send(testUser);
  return response.body;
}

export async function loginTestUser(app: Application): Promise<string> {
  const response = await request(app).post('/api/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  return response.body.token;
}

export async function createTestProject(app: Application, token: string): Promise<any> {
  const response = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send(testProject);
  return response.body;
}

export async function createTestAgent(app: Application, token: string): Promise<any> {
  const response = await request(app)
    .post('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .send(testAgent);
  return response.body;
}

export async function cleanupDatabase(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.getRepository(User).clear();
    await AppDataSource.getRepository(Project).clear();
    await AppDataSource.getRepository(Agent).clear();
  } catch (error) {
    console.error('Error cleaning up database:', error);
    throw error;
  }
}

export function expectUser(user: any): void {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email', testUser.email);
  expect(user).toHaveProperty('name', testUser.name);
  expect(user).not.toHaveProperty('password');
  expect(user).toHaveProperty('provider', testUser.provider);
  expect(user).toHaveProperty('created_at');
  expect(user).toHaveProperty('updated_at');
}

export function expectProject(project: any): void {
  expect(project).toHaveProperty('id');
  expect(project).toHaveProperty('name', testProject.name);
  expect(project).toHaveProperty('description', testProject.description);
  expect(project).toHaveProperty('status', testProject.status);
  expect(project).toHaveProperty('completion', testProject.completion);
  expect(project).toHaveProperty('agents_assigned');
  expect(project).toHaveProperty('created_at');
  expect(project).toHaveProperty('updated_at');
}

export function expectAgent(agent: any): void {
  expect(agent).toHaveProperty('id');
  expect(agent).toHaveProperty('name', testAgent.name);
  expect(agent).toHaveProperty('type', testAgent.type);
  expect(agent).toHaveProperty('status', testAgent.status);
  expect(agent).toHaveProperty('performance');
  expect(agent).toHaveProperty('capabilities');
  expect(agent).toHaveProperty('learningRate', testAgent.learningRate);
  expect(agent).toHaveProperty('maxConcurrentTasks', testAgent.maxConcurrentTasks);
  expect(agent).toHaveProperty('created_at');
  expect(agent).toHaveProperty('updated_at');
}
