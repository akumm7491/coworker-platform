import { Router } from 'express';
import { authController } from '../services/identity/controllers/authController.js';
import { agentController } from '../services/agent/controllers/AgentController.js';
import { monitoringController } from '../services/shared/monitoring/MonitoringController.js';
import { permissionService } from '../services/shared/security/PermissionService.js';
import { MiddlewareFactory } from '../services/shared/middlewareFactory.js';

const router = Router();

// Auth routes
router.use(authController.router);

// Agent routes (protected)
router.use(
  agentController.router,
  MiddlewareFactory.authenticate(),
  MiddlewareFactory.authorize(permissionService, ['agent:*']),
);

// Monitoring routes (protected)
router.use(
  monitoringController.router,
  MiddlewareFactory.authenticate(),
  MiddlewareFactory.authorize(permissionService, ['monitoring:*']),
);

export default router;
