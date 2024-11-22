import express from 'express';
import { Pool } from 'pg';
import { createMetricsRouter } from './routes/metrics';
import { createAlertsRouter } from './routes/alerts';

const app = express();
const PORT = process.env.PORT || 3453;

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Routes
app.use('/metrics', createMetricsRouter(pool));
app.use('/alerts', createAlertsRouter(pool));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Monitoring service running on port ${PORT}`);
});
