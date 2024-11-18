import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database.js';
import { Agent, AgentStatus } from '../models/Agent.js';
import { createLogger } from '../utils/logger.js';
import { AsyncRouteHandler } from '../types/route-handler.js';
import { AppError } from '../middleware/error.js';

const logger = createLogger('agent-routes');
const router = Router();
const agentRepository = AppDataSource.getRepository(Agent);

const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  next();
};

// GET /api/agents
const getAgents: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  try {
    const agents = await agentRepository.find({
      where: { ownerId: user.id },
      relations: ['user'],
    });
    return res.json(agents);
  } catch (error) {
    logger.error('Error fetching agents:', error);
    throw new AppError('Internal server error', 500);
  }
};

// GET /api/agents/:id
const getAgent: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  try {
    const agent = await agentRepository.findOne({
      where: { id: req.params.id, ownerId: user.id },
      relations: ['user'],
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    return res.json(agent);
  } catch (error) {
    logger.error('Error fetching agent:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Internal server error', 500);
  }
};

// POST /api/agents
const createAgent: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  try {
    const agent = agentRepository.create({
      ...req.body,
      userId: user.id,
    });
    await agentRepository.save(agent);
    return res.status(201).json(agent);
  } catch (error) {
    logger.error('Error creating agent:', error);
    throw new AppError('Internal server error', 500);
  }
};

// PUT /api/agents/:id
const updateAgent: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  try {
    const agent = await agentRepository.findOne({
      where: { id: req.params.id, ownerId: user.id },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    await agentRepository.update(req.params.id, req.body);
    const updatedAgent = await agentRepository.findOne({
      where: { id: req.params.id },
    });

    return res.json(updatedAgent);
  } catch (error) {
    logger.error('Error updating agent:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Internal server error', 500);
  }
};

// DELETE /api/agents/:id
const deleteAgent: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  try {
    const agent = await agentRepository.findOne({
      where: { id: req.params.id, ownerId: user.id },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    await agentRepository.remove(agent);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting agent:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Internal server error', 500);
  }
};

// PUT /api/agents/:id/train
const trainAgent: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  try {
    const agent = await agentRepository.findOne({
      where: { id: req.params.id, ownerId: user.id },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    // Add training logic here
    agent.status = AgentStatus.TRAINING;
    await agentRepository.save(agent);

    return res.json(agent);
  } catch (error) {
    logger.error('Error training agent:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Internal server error', 500);
  }
};

// PUT /api/agents/:id/deploy
const deployAgent: AsyncRouteHandler = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  try {
    const agent = await agentRepository.findOne({
      where: { id: req.params.id, ownerId: user.id },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    // Add deployment logic here
    agent.status = AgentStatus.DEPLOYED;
    await agentRepository.save(agent);

    return res.json(agent);
  } catch (error) {
    logger.error('Error deploying agent:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Internal server error', 500);
  }
};

// Apply requireAuth middleware to all routes
router.use(requireAuth);

router.get('/', getAgents);
router.get('/:id', getAgent);
router.post('/', createAgent);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);
router.put('/:id/train', trainAgent);
router.put('/:id/deploy', deployAgent);

export default router;
