import { Router, Request, Response, NextFunction } from 'express';
import type { Project } from '../types/shared.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error.js';

const router = Router();

// In-memory store for development
let projects: Project[] = [
  {
    id: uuidv4(),
    name: "Project Alpha",
    description: "AI-driven automation system",
    status: "in_progress",
    completion: 75,
    agents_assigned: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Get all projects
router.get('/', (req: Request, res: Response) => {
  res.json(projects);
});

// Get project by ID
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return next(new AppError(404, 'Project not found'));
  }
  res.json(project);
});

// Create new project
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const newProject: Project = {
      id: uuidv4(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    next(new AppError(400, 'Invalid project data'));
  }
});

// Update project
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return next(new AppError(404, 'Project not found'));
  }
  
  try {
    projects[index] = {
      ...projects[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    res.json(projects[index]);
  } catch (error) {
    next(new AppError(400, 'Invalid project data'));
  }
});

// Delete project
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return next(new AppError(404, 'Project not found'));
  }
  
  projects = projects.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

// Assign agent to project
router.post('/:id/agents/:agentId', (req: Request, res: Response, next: NextFunction) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return next(new AppError(404, 'Project not found'));
  }

  const agentId: string = req.params.agentId;
  if (!project.agents_assigned.includes(agentId)) {
    project.agents_assigned.push(agentId);
    project.updated_at = new Date().toISOString();
  }

  res.json(project);
});

// Remove agent from project
router.delete('/:id/agents/:agentId', (req: Request, res: Response, next: NextFunction) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return next(new AppError(404, 'Project not found'));
  }

  const agentId: string = req.params.agentId;
  project.agents_assigned = project.agents_assigned.filter(id => id !== agentId);
  project.updated_at = new Date().toISOString();

  res.json(project);
});

export default router;
