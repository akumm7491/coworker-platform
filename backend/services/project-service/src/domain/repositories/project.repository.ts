import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { BaseRepository } from '@coworker/shared';

@Injectable()
export class ProjectRepository extends BaseRepository<Project> {
  constructor(private dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }

  async findByTeamMember(userId: string): Promise<Project[]> {
    return this.find({
      where: {
        teamMembers: userId,
        isArchived: false,
      },
    });
  }

  async archiveProject(id: string): Promise<void> {
    await this.update(id, { isArchived: true });
  }

  async addTeamMember(id: string, userId: string): Promise<void> {
    const project = await this.findOne({ where: { id } });
    if (!project) {
      throw new Error('Project not found');
    }
    
    if (!project.teamMembers.includes(userId)) {
      project.teamMembers.push(userId);
      await this.save(project);
    }
  }
}
