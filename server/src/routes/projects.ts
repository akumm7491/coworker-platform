import { Router, Request, Response, NextFunction } from 'express';
import type { Project, ProjectTask } from '../types/shared.js';
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
    updated_at: new Date().toISOString(),
    tasks: []
  }
];

// Get all projects
router.get('/', (_req: Request, res: Response) => {
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
      tasks: [],
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
    const updatedProject = {
      ...projects[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    projects[index] = updatedProject;
    res.json(updatedProject);
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

  projects.splice(index, 1);
  res.status(204).send();
});

// Task Routes

// Get all tasks for a project
router.get('/:projectId/tasks', (req: Request, res: Response, next: NextFunction) => {
  const project = projects.find(p => p.id === req.params.projectId);
  if (!project) {
    return next(new AppError(404, 'Project not found'));
  }
  res.json(project.tasks || []);
});

// Create new task
router.post('/:projectId/tasks', (req: Request, res: Response, next: NextFunction) => {
  const project = projects.find(p => p.id === req.params.projectId);
  if (!project) {
    return next(new AppError(404, 'Project not found'));
  }

  try {
    const newTask: ProjectTask = {
      id: uuidv4(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!project.tasks) {
      project.tasks = [];
    }
    project.tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    next(new AppError(400, 'Invalid task data'));
  }
});

// Update task
router.put('/:projectId/tasks/:taskId', (req: Request, res: Response, next: NextFunction) => {
  const project = projects.find(p => p.id === req.params.projectId);
  if (!project) {
    return next(new AppError(404, 'Project not found'));
  }

  const taskIndex = project.tasks?.findIndex(t => t.id === req.params.taskId);
  if (!project.tasks || taskIndex === -1) {
    return next(new AppError(404, 'Task not found'));
  }

  try {
    const updatedTask = {
      ...project.tasks[taskIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    project.tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  } catch (error) {
    next(new AppError(400, 'Invalid task data'));
  }
});

// Delete task
router.delete('/:projectId/tasks/:taskId', (req: Request, res: Response, next: NextFunction) => {
  const project = projects.find(p => p.id === req.params.projectId);
  if (!project) {
    return next(new AppError(404, 'Project not found'));
  }

  const taskIndex = project.tasks?.findIndex(t => t.id === req.params.taskId);
  if (!project.tasks || taskIndex === -1) {
    return next(new AppError(404, 'Task not found'));
  }

  project.tasks.splice(taskIndex, 1);
  res.status(204).send();
});

export default router;
