import { Router } from 'express';
import { AppDataSource } from '../config/database.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { AsyncRouteHandler } from '../types/route-handler.js';
import logger from '../utils/logger.js';
import { User } from '../models/User.js';

const router = Router({ mergeParams: true }); // Important for accessing projectId from parent router
const taskRepository = AppDataSource.getRepository(Task);
const projectRepository = AppDataSource.getRepository(Project);

// POST /api/projects/:projectId/tasks
const createTask: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId } = req.params;
    const project = await projectRepository.findOne({
      where: { id: projectId, ownerId: (req.user as User).id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = taskRepository.create({
      ...req.body,
      projectId,
    });

    await taskRepository.save(task);
    return res.status(201).json(task);
  } catch (error) {
    logger.error('Error creating task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/projects/:projectId/tasks
const getTasks: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId } = req.params;
    const project = await projectRepository.findOne({
      where: { id: projectId, ownerId: (req.user as User).id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await taskRepository.find({
      where: { projectId },
      order: { updatedAt: 'DESC' },
      relations: ['project'], // Include project relation
    });

    return res.json(tasks);
  } catch (error) {
    logger.error('Error getting tasks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/projects/:projectId/tasks/:taskId
const getTask: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId, taskId } = req.params;
    const project = await projectRepository.findOne({
      where: { id: projectId, ownerId: (req.user as User).id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await taskRepository.findOne({
      where: { id: taskId, projectId },
      relations: ['project'], // Include project relation
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    logger.error('Error getting task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/projects/:projectId/tasks/:taskId
const updateTask: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId, taskId } = req.params;
    const project = await projectRepository.findOne({
      where: { id: projectId, ownerId: (req.user as User).id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await taskRepository.findOne({
      where: { id: taskId, projectId },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await taskRepository.update(taskId, req.body);
    const updatedTask = await taskRepository.findOne({
      where: { id: taskId },
      relations: ['project'], // Include project relation
    });

    return res.json(updatedTask);
  } catch (error) {
    logger.error('Error updating task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/projects/:projectId/tasks/:taskId
const deleteTask: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId, taskId } = req.params;
    const project = await projectRepository.findOne({
      where: { id: projectId, ownerId: (req.user as User).id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await taskRepository.findOne({
      where: { id: taskId, projectId },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await taskRepository.remove(task);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:taskId', getTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
