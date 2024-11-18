import { describe, test as it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import {
  testProject,
  testTask,
  expectProject,
  expectTask,
  cleanupDatabase,
} from '../helpers/testHelper';

describe('Projects API', () => {
  beforeEach(async () => {
    await cleanupDatabase(app);
  });

  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      const response = await request(app).get('/api/projects');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app).post('/api/projects').send(testProject);

      expect(response.status).toBe(201);
      expectProject(response.body);
      expect(response.body.name).toBe(testProject.name);
      expect(response.body.description).toBe(testProject.description);
    });

    it('should return 400 for invalid project data', async () => {
      const response = await request(app).post('/api/projects').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a project by id', async () => {
      // Create a project first
      const createResponse = await request(app).post('/api/projects').send(testProject);

      const response = await request(app).get(`/api/projects/${createResponse.body.id}`);

      expect(response.status).toBe(200);
      expectProject(response.body);
      expect(response.body.id).toBe(createResponse.body.id);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app).get('/api/projects/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update a project', async () => {
      // Create a project first
      const createResponse = await request(app).post('/api/projects').send(testProject);

      const updateData = {
        name: 'Updated Project',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/projects/${createResponse.body.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expectProject(response.body);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/projects/non-existent-id')
        .send({ name: 'Updated Project' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project', async () => {
      // Create a project first
      const createResponse = await request(app).post('/api/projects').send(testProject);

      const response = await request(app).delete(`/api/projects/${createResponse.body.id}`);

      expect(response.status).toBe(204);

      // Verify project is deleted
      const getResponse = await request(app).get(`/api/projects/${createResponse.body.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app).delete('/api/projects/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('Project Tasks API', () => {
    let projectId: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/projects').send(testProject);
      projectId = response.body.id;
    });

    describe('GET /api/projects/:projectId/tasks', () => {
      it('should return all tasks for a project', async () => {
        const response = await request(app).get(`/api/projects/${projectId}/tasks`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should return 404 for non-existent project', async () => {
        const response = await request(app).get('/api/projects/non-existent-id/tasks');

        expect(response.status).toBe(404);
      });
    });

    describe('POST /api/projects/:projectId/tasks', () => {
      it('should create a new task', async () => {
        const response = await request(app).post(`/api/projects/${projectId}/tasks`).send(testTask);

        expect(response.status).toBe(201);
        expectTask(response.body);
        expect(response.body.title).toBe(testTask.title);
        expect(response.body.description).toBe(testTask.description);
      });

      it('should return 404 for non-existent project', async () => {
        const response = await request(app)
          .post('/api/projects/non-existent-id/tasks')
          .send(testTask);

        expect(response.status).toBe(404);
      });
    });

    describe('PUT /api/projects/:projectId/tasks/:taskId', () => {
      it('should update a task', async () => {
        // Create a task first
        const createResponse = await request(app)
          .post(`/api/projects/${projectId}/tasks`)
          .send(testTask);

        const updateData = {
          title: 'Updated Task',
          description: 'Updated description',
        };

        const response = await request(app)
          .put(`/api/projects/${projectId}/tasks/${createResponse.body.id}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expectTask(response.body);
        expect(response.body.title).toBe(updateData.title);
        expect(response.body.description).toBe(updateData.description);
      });

      it('should return 404 for non-existent task', async () => {
        const response = await request(app)
          .put(`/api/projects/${projectId}/tasks/non-existent-id`)
          .send({ title: 'Updated Task' });

        expect(response.status).toBe(404);
      });
    });

    describe('DELETE /api/projects/:projectId/tasks/:taskId', () => {
      it('should delete a task', async () => {
        // Create a task first
        const createResponse = await request(app)
          .post(`/api/projects/${projectId}/tasks`)
          .send(testTask);

        const response = await request(app).delete(
          `/api/projects/${projectId}/tasks/${createResponse.body.id}`,
        );

        expect(response.status).toBe(204);

        // Verify task is deleted
        const getResponse = await request(app).get(`/api/projects/${projectId}/tasks`);
        expect(getResponse.body).not.toContainEqual(
          expect.objectContaining({ id: createResponse.body.id }),
        );
      });

      it('should return 404 for non-existent task', async () => {
        const response = await request(app).delete(
          `/api/projects/${projectId}/tasks/non-existent-id`,
        );

        expect(response.status).toBe(404);
      });
    });
  });
});
