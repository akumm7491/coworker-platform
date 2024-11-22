import { Router } from 'express';
import { Pool } from 'pg';

export const createAlertsRouter = (pool: Pool) => {
  const router = Router();

  // Get alerts
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  // Create new alert
  router.post('/', async (req, res) => {
    const { name, severity, message } = req.body;
    try {
      await pool.query('INSERT INTO alerts (name, severity, message) VALUES ($1, $2, $3)', [
        name,
        severity,
        message,
      ]);
      res.status(201).json({ message: 'Alert created successfully' });
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  });

  return router;
};
