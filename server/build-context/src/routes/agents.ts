import { Router } from 'express';
import { Agent } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error';

const router = Router();

// In-memory store for development
let agents: Agent[] = [
  {
    id: uuidv4(),
    name: "Agent Smith",
    status: "idle",
    type: "assistant",
    tasks_completed: 0,
    success_rate: 1.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Get all agents
router.get('/', (req, res) => {
  res.json(agents);
});

// Get agent by ID
router.get('/:id', (req, res, next) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) {
    return next(new AppError(404, 'Agent not found'));
  }
  res.json(agent);
});

// Create new agent
router.post('/', (req, res, next) => {
  try {
    const newAgent: Agent = {
      id: uuidv4(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    agents.push(newAgent);
    res.status(201).json(newAgent);
  } catch (error) {
    next(new AppError(400, 'Invalid agent data'));
  }
});

// Update agent
router.put('/:id', (req, res, next) => {
  const index = agents.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return next(new AppError(404, 'Agent not found'));
  }
  
  try {
    agents[index] = {
      ...agents[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    res.json(agents[index]);
  } catch (error) {
    next(new AppError(400, 'Invalid agent data'));
  }
});

// Delete agent
router.delete('/:id', (req, res, next) => {
  const index = agents.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return next(new AppError(404, 'Agent not found'));
  }
  
  agents = agents.filter(a => a.id !== req.params.id);
  res.status(204).send();
});

export default router;
