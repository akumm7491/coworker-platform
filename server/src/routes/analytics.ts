import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database.js';
import { Project } from '../models/Project.js';
import { Agent } from '../models/Agent.js';
import logger from '../utils/logger.js';
import { AsyncRouteHandler } from '../types/route-handler.js';
import { AppError } from '../middleware/error.js';

const router = Router();
const projectRepository = AppDataSource.getRepository(Project);
const agentRepository = AppDataSource.getRepository(Agent);

const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  next();
};

// GET /api/analytics/overview
const getOverview: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user!; // Safe to use ! here because of requireAuth middleware

    // Get project statistics
    const projectStats = await projectRepository
      .createQueryBuilder('project')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN status = :active THEN 1 END) as active',
        'COUNT(CASE WHEN status = :archived THEN 1 END) as archived',
      ])
      .where('project.userId = :userId', { userId: user.id })
      .setParameters({
        active: 'active',
        archived: 'archived',
      })
      .getRawOne();

    // Get agent statistics
    const agentStats = await agentRepository
      .createQueryBuilder('agent')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN status = :active THEN 1 END) as active',
        'COUNT(CASE WHEN status = :training THEN 1 END) as training',
        'COUNT(CASE WHEN status = :error THEN 1 END) as error',
      ])
      .where('agent.userId = :userId', { userId: user.id })
      .setParameters({
        active: 'active',
        training: 'training',
        error: 'error',
      })
      .getRawOne();

    // Calculate usage statistics (example metrics)
    const usageStats = {
      apiCalls: 1000, // Replace with actual metrics
      storageUsed: '500MB',
      lastActive: new Date(),
    };

    return res.json({
      success: true,
      data: {
        projects: projectStats,
        agents: agentStats,
        usage: usageStats,
      },
    });
  } catch (error) {
    logger.error('Error getting analytics overview:', error);
    throw error;
  }
};

// GET /api/analytics/usage
const getUsage: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Implementation for usage analytics
    return res.json({
      success: true,
      data: {
        apiCalls: 1000,
        storageUsed: '500MB',
        lastActive: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error getting usage analytics:', error);
    throw error;
  }
};

router.get('/overview', requireAuth, getOverview);
router.get('/usage', requireAuth, getUsage);

export default router;
