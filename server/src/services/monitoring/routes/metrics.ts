import { Router } from 'express';
import { Pool } from 'pg';

export const createMetricsRouter = (pool: Pool) => {
  const router = Router();

  // Get metrics
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 100');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Record new metric
  router.post('/', async (req, res) => {
    const { name, value, tags } = req.body;
    try {
      await pool.query('INSERT INTO metrics (name, value, tags) VALUES ($1, $2, $3)', [
        name,
        value,
        tags,
      ]);
      res.status(201).json({ message: 'Metric recorded successfully' });
    } catch (error) {
      console.error('Error recording metric:', error);
      res.status(500).json({ error: 'Failed to record metric' });
    }
  });

  return router;
};
