import { Router } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';

export const createCollaborationRouter = (pool: Pool, redis: Redis) => {
  const router = Router();

  // Get active sessions
  router.get('/sessions', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM collaboration_sessions WHERE active = true');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });

  // Create new session
  router.post('/sessions', async (req, res) => {
    const { name, type } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO collaboration_sessions (name, type, active) VALUES ($1, $2, true) RETURNING *',
        [name, type],
      );
      const session = result.rows[0];
      await redis.publish('session:created', JSON.stringify(session));
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  // End session
  router.post('/sessions/:id/end', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('UPDATE collaboration_sessions SET active = false WHERE id = $1', [id]);
      await redis.publish('session:ended', id);
      res.json({ message: 'Session ended successfully' });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  });

  return router;
};
