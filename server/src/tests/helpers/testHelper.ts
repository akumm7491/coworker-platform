import { expect } from '@jest/globals';
import { Application } from 'express';
import request from 'supertest';
import { Project, ProjectTask, Agent } from '../../types/shared';

export const testProject: Partial<Project> = {
  name: "Test Project",
  description: "A test project",
  status: "in_progress",
  completion: 0,
  agents_assigned: []
};

export const testTask: Partial<ProjectTask> = {
  title: "Test Task",
  description: "A test task",
  status: "pending",
  priority: "medium",
  assignedTo: "",
  dependencies: [],
  progress: 0
};

export const testAgent: Partial<Agent> = {
  name: "Test Agent",
  type: "developer",
  status: "idle",
  performance: {
    tasksCompleted: 0,
    successRate: 100,
    averageTime: 0
  },
  capabilities: ["testing"],
  learningRate: 1.0,
  maxConcurrentTasks: 3,
  description: "A test agent"
};

export async function createTestProject(app: Application): Promise<Project> {
  const response = await request(app)
    .post('/api/projects')
    .send(testProject);
  return response.body;
}

export async function createTestTask(app: Application, projectId: string): Promise<ProjectTask> {
  const response = await request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .send(testTask);
  return response.body;
}

export async function createTestAgent(app: Application): Promise<Agent> {
  const response = await request(app)
    .post('/api/agents')
    .send(testAgent);
  return response.body;
}

export async function cleanupDatabase(_app: Application): Promise<void> {
  // For now, we're using in-memory storage, so no cleanup needed
  // When we add a database, we'll add cleanup logic here
}

export function expectProject(project: any): void {
  expect(project).toHaveProperty('id');
  expect(project).toHaveProperty('name');
  expect(project).toHaveProperty('description');
  expect(project).toHaveProperty('status');
  expect(project).toHaveProperty('completion');
  expect(project).toHaveProperty('agents_assigned');
  expect(project).toHaveProperty('created_at');
  expect(project).toHaveProperty('updated_at');
}

export function expectTask(task: any): void {
  expect(task).toHaveProperty('id');
  expect(task).toHaveProperty('title');
  expect(task).toHaveProperty('description');
  expect(task).toHaveProperty('status');
  expect(task).toHaveProperty('priority');
  expect(task).toHaveProperty('assignedTo');
  expect(task).toHaveProperty('created_at');
  expect(task).toHaveProperty('updated_at');
}

export function expectAgent(agent: any): void {
  expect(agent).toHaveProperty('id');
  expect(agent).toHaveProperty('name');
  expect(agent).toHaveProperty('type');
  expect(agent).toHaveProperty('status');
  expect(agent).toHaveProperty('performance');
  expect(agent).toHaveProperty('capabilities');
  expect(agent).toHaveProperty('created_at');
  expect(agent).toHaveProperty('updated_at');
}
