import { Router } from 'express';
import { AppDataSource } from '../config/database.js';
import { FindOptionsWhere } from 'typeorm';
import { Project, ProjectStatus } from '../models/Project.js';
import logger from '../utils/logger.js';
import { AsyncRouteHandler } from '../types/route-handler.js';
import { protect } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = Router();
const projectRepository = AppDataSource.getRepository(Project);

// GET /api/projects
const getProjects: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const projects = await projectRepository.find({
      where: { ownerId: (req.user as User).id } as FindOptionsWhere<Project>,
      order: { updatedAt: 'DESC' },
    });

    return res.json(projects);
  } catch (error) {
    logger.error('Error getting projects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/projects/:id
const getProject: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const project = await projectRepository.findOne({
      where: { id: req.params.id, ownerId: (req.user as User).id } as FindOptionsWhere<Project>,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    logger.error('Error getting project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/projects
const createProject: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const project = projectRepository.create({
      ...req.body,
      ownerId: (req.user as User).id,
    });

    await projectRepository.save(project);
    return res.status(201).json(project);
  } catch (error) {
    logger.error('Error creating project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/projects/:id
const updateProject: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const project = await projectRepository.findOne({
      where: { id: req.params.id, ownerId: (req.user as User).id } as FindOptionsWhere<Project>,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    Object.assign(project, req.body);
    await projectRepository.save(project);
    return res.json(project);
  } catch (error) {
    logger.error('Error updating project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/projects/:id
const deleteProject: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const project = await projectRepository.findOne({
      where: { id: req.params.id, ownerId: (req.user as User).id } as FindOptionsWhere<Project>,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await projectRepository.remove(project);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/projects/:id/archive
const archiveProject: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const project = await projectRepository.findOne({
      where: { id: req.params.id, ownerId: (req.user as User).id } as FindOptionsWhere<Project>,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.status = ProjectStatus.ARCHIVED;
    await projectRepository.save(project);
    return res.json(project);
  } catch (error) {
    logger.error('Error archiving project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/projects/:id/restore
const restoreProject: AsyncRouteHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const project = await projectRepository.findOne({
      where: { id: req.params.id, ownerId: (req.user as User).id } as FindOptionsWhere<Project>,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.status = ProjectStatus.ACTIVE;
    await projectRepository.save(project);
    return res.json(project);
  } catch (error) {
    logger.error('Error restoring project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.put('/:id/archive', protect, archiveProject);
router.put('/:id/restore', protect, restoreProject);

export default router;
