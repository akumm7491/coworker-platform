import { describe, test as it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import {
  cleanupDatabase,
  testAgent,
  expectAgent,
  createTestUser,
  loginTestUser,
} from '../helpers/testHelper.js';

describe('Agents API', () => {
  let authToken: string;

  beforeEach(async () => {
    await cleanupDatabase();
    await createTestUser(app);
    authToken = await loginTestUser(app);
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAgent);

      expect(response.status).toBe(201);
      expectAgent(response.body);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).post('/api/agents').send(testAgent);

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid agent data', async () => {
      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/agents', () => {
    beforeEach(async () => {
      // Create a test agent
      await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAgent);
    });

    it('should return all agents', async () => {
      const response = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expectAgent(response.body[0]);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/agents');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/agents/:id', () => {
    let agentId: string;

    beforeEach(async () => {
      // Create a test agent
      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAgent);
      agentId = response.body.id;
    });

    it('should return a specific agent', async () => {
      const response = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expectAgent(response.body);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .get('/api/agents/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get(`/api/agents/${agentId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/agents/:id', () => {
    let agentId: string;

    beforeEach(async () => {
      // Create a test agent
      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAgent);
      agentId = response.body.id;
    });

    it('should update an agent', async () => {
      const updatedData = {
        ...testAgent,
        name: 'Updated Agent Name',
      };

      const response = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);
      expectAgent(response.body);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .put('/api/agents/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAgent);

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).put(`/api/agents/${agentId}`).send(testAgent);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/agents/:id', () => {
    let agentId: string;

    beforeEach(async () => {
      // Create a test agent
      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAgent);
      agentId = response.body.id;
    });

    it('should delete an agent', async () => {
      const response = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify agent is deleted
      const getResponse = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .delete('/api/agents/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).delete(`/api/agents/${agentId}`);

      expect(response.status).toBe(401);
    });
  });
});
