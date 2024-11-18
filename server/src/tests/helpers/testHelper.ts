import { Application } from 'express';
import request from 'supertest';
import { Project, ProjectTask, Agent } from '../../types/shared';
import { DatabaseProject, DatabaseTask, DatabaseAgent } from '../../types/database';

export const testProject: Partial<Project> = {
  name: 'Test Project',
  description: 'A test project',
  status: 'in_progress',
  completion: 0,
  agents_assigned: [],
};

export const testTask: Partial<ProjectTask> = {
  title: 'Test Task',
  description: 'A test task',
  status: 'pending',
  priority: 'medium',
  assignedTo: '',
  dependencies: [],
  progress: 0,
};

export const testAgent: Partial<Agent> = {
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

export async function createTestProject(app: Application): Promise<DatabaseProject> {
  const response = await request(app).post('/api/projects').send(testProject);
  return response.body;
}

export async function createTestTask(app: Application, projectId: string): Promise<DatabaseTask> {
  const response = await request(app).post(`/api/projects/${projectId}/tasks`).send(testTask);
  return response.body;
}

export async function createTestAgent(app: Application): Promise<DatabaseAgent> {
  const response = await request(app).post('/api/agents').send(testAgent);
  return response.body;
}

export async function cleanupDatabase(app: Application): Promise<void> {
  await request(app).delete('/api/test/cleanup');
}

export function expectProject(project: DatabaseProject): void {
  expect(project).toHaveProperty('id');
  expect(project).toHaveProperty('name', testProject.name);
  expect(project).toHaveProperty('description', testProject.description);
  expect(project).toHaveProperty('status', testProject.status);
  expect(project).toHaveProperty('completion', testProject.completion);
  expect(project).toHaveProperty('agents_assigned');
  expect(project).toHaveProperty('created_at');
  expect(project).toHaveProperty('updated_at');
}

export function expectTask(task: DatabaseTask): void {
  expect(task).toHaveProperty('id');
  expect(task).toHaveProperty('title', testTask.title);
  expect(task).toHaveProperty('description', testTask.description);
  expect(task).toHaveProperty('status', testTask.status);
  expect(task).toHaveProperty('priority', testTask.priority);
  expect(task).toHaveProperty('assignedTo', testTask.assignedTo);
  expect(task).toHaveProperty('dependencies');
  expect(task).toHaveProperty('created_at');
  expect(task).toHaveProperty('updated_at');
}

export function expectAgent(agent: DatabaseAgent): void {
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
