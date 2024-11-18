import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../models/Project.js';
import { ProjectRepository } from '../../config/database.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ProjectService');

export interface CreateProjectInput {
  name: string;
  description: string;
  status?: ProjectStatus;
  completion?: number;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  completion?: number;
  agents_assigned?: string[];
}

export class ProjectService {
  private repository: Repository<Project>;

  constructor() {
    this.repository = ProjectRepository as Repository<Project>;
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    try {
      const project = this.repository.create({
        name: input.name,
        description: input.description,
        status: input.status || ProjectStatus.NOT_STARTED,
        completion: input.completion || 0,
        agents_assigned: [],
      });

      return await this.repository.save(project);
    } catch (error) {
      logger.error('Failed to create project:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      const project = await this.repository.findOne({ where: { id } });
      if (!project) {
        throw new Error(`Project ${id} not found`);
      }
      return project;
    } catch (error) {
      logger.error(`Failed to get project ${id}:`, error);
      throw error;
    }
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      logger.error('Failed to get all projects:', error);
      throw error;
    }
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    try {
      const project = await this.getProject(id);
      Object.assign(project, input);
      await this.repository.save(project);
      logger.info(`Updated project ${id}`);
      return project;
    } catch (error) {
      logger.error(`Failed to update project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      logger.info(`Deleted project ${id}`);
    } catch (error) {
      logger.error(`Failed to delete project ${id}:`, error);
      throw error;
    }
  }

  async assignAgentToProject(projectId: string, agentId: string): Promise<Project> {
    try {
      const project = await this.getProject(projectId);
      if (!project.agents_assigned) {
        project.agents_assigned = [];
      }
      if (!project.agents_assigned.includes(agentId)) {
        project.agents_assigned.push(agentId);
        await this.repository.save(project);
        logger.info(`Assigned agent ${agentId} to project ${projectId}`);
      }
      return project;
    } catch (error) {
      logger.error(`Failed to assign agent ${agentId} to project ${projectId}:`, error);
      throw error;
    }
  }

  async removeAgentFromProject(projectId: string, agentId: string): Promise<Project> {
    try {
      const project = await this.getProject(projectId);
      if (project.agents_assigned) {
        project.agents_assigned = project.agents_assigned.filter(id => id !== agentId);
        await this.repository.save(project);
        logger.info(`Removed agent ${agentId} from project ${projectId}`);
      }
      return project;
    } catch (error) {
      logger.error(`Failed to remove agent ${agentId} from project ${projectId}:`, error);
      throw error;
    }
  }

  async updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
    return this.updateProject(id, { status });
  }

  async updateProjectCompletion(id: string, completion: number): Promise<Project> {
    if (completion < 0 || completion > 100) {
      throw new Error('Completion must be between 0 and 100');
    }
    return this.updateProject(id, { completion });
  }
}

export const projectService = new ProjectService();
