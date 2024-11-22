import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3450;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Proxy middleware configuration
const createServiceProxy = (target: string) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/[^/]+/`]: '/',
    },
  });
};

// Service routes
app.use(
  '/api/identity',
  createServiceProxy(process.env.IDENTITY_SERVICE_URL || 'http://identity-service:3451'),
);

app.use(
  '/api/agent',
  createServiceProxy(process.env.AGENT_SERVICE_URL || 'http://agent-service:3452'),
);

app.use(
  '/api/monitoring',
  createServiceProxy(process.env.MONITORING_SERVICE_URL || 'http://monitoring-service:3453'),
);

app.use(
  '/api/collaboration',
  createServiceProxy(process.env.COLLABORATION_SERVICE_URL || 'http://collaboration-service:3454'),
);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
