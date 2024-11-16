import { describe, test as it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import {
  testAgent,
  expectAgent,
  cleanupDatabase
} from '../helpers/testHelper';

describe('Agents API', () => {
  beforeEach(async () => {
    await cleanupDatabase(app);
  });

  describe('GET /api/agents', () => {
    it('should return all agents', async () => {
      const response = await request(app).get('/api/agents');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const response = await request(app)
        .post('/api/agents')
        .send(testAgent);

      expect(response.status).toBe(201);
      expectAgent(response.body);
      expect(response.body.name).toBe(testAgent.name);
      expect(response.body.type).toBe(testAgent.type);
    });

    it('should return 400 for invalid agent data', async () => {
      const response = await request(app)
        .post('/api/agents')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should return an agent by id', async () => {
      // Create an agent first
      const createResponse = await request(app)
        .post('/api/agents')
        .send(testAgent);

      const response = await request(app)
        .get(`/api/agents/${createResponse.body.id}`);

      expect(response.status).toBe(200);
      expectAgent(response.body);
      expect(response.body.id).toBe(createResponse.body.id);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .get('/api/agents/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/agents/:id', () => {
    it('should update an agent', async () => {
      // Create an agent first
      const createResponse = await request(app)
        .post('/api/agents')
        .send(testAgent);

      const updateData = {
        name: 'Updated Agent',
        description: 'Updated description',
        capabilities: ['testing', 'debugging']
      };

      const response = await request(app)
        .put(`/api/agents/${createResponse.body.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expectAgent(response.body);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.capabilities).toEqual(updateData.capabilities);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .put('/api/agents/non-existent-id')
        .send({ name: 'Updated Agent' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should delete an agent', async () => {
      // Create an agent first
      const createResponse = await request(app)
        .post('/api/agents')
        .send(testAgent);

      const response = await request(app)
        .delete(`/api/agents/${createResponse.body.id}`);

      expect(response.status).toBe(204);

      // Verify agent is deleted
      const getResponse = await request(app)
        .get(`/api/agents/${createResponse.body.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .delete('/api/agents/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('Agent Capabilities', () => {
    it('should handle adding new capabilities', async () => {
      // Create an agent first
      const createResponse = await request(app)
        .post('/api/agents')
        .send(testAgent);

      const updateData = {
        capabilities: [...testAgent.capabilities, 'debugging', 'deployment']
      };

      const response = await request(app)
        .put(`/api/agents/${createResponse.body.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expectAgent(response.body);
      expect(response.body.capabilities).toEqual(updateData.capabilities);
    });

    it('should handle removing capabilities', async () => {
      // Create an agent first
      const createResponse = await request(app)
        .post('/api/agents')
        .send({
          ...testAgent,
          capabilities: ['testing', 'debugging', 'deployment']
        });

      const updateData = {
        capabilities: ['testing']
      };

      const response = await request(app)
        .put(`/api/agents/${createResponse.body.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expectAgent(response.body);
      expect(response.body.capabilities).toEqual(updateData.capabilities);
    });
  });
});
