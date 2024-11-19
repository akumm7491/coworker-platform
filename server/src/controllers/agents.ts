import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { AppDataSource } from '../config/database.js';
import { Agent } from '../models/Agent.js';
import { AppError } from '../middleware/error.js';

const agentRepository = AppDataSource.getRepository(Agent);

export const getAgents = catchAsync(async (req: Request, res: Response) => {
  const agents = await agentRepository.find({
    where: { ownerId: req.user.id },
    relations: ['owner'],
  });
  res.status(200).json(agents);
});

export const createAgent = catchAsync(async (req: Request, res: Response) => {
  const agent = agentRepository.create({
    ...req.body,
    ownerId: req.user.id,
  });
  await agentRepository.save(agent);
  res.status(201).json(agent);
});

export const updateAgent = catchAsync(async (req: Request, res: Response) => {
  const agent = await agentRepository.findOne({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!agent) {
    throw new AppError('Agent not found', 404);
  }

  Object.assign(agent, req.body);
  await agentRepository.save(agent);
  res.status(200).json(agent);
});

export const deleteAgent = catchAsync(async (req: Request, res: Response) => {
  const agent = await agentRepository.findOne({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!agent) {
    throw new AppError('Agent not found', 404);
  }

  await agentRepository.remove(agent);
  res.status(204).send();
});
