import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectStatus } from '@coworker/shared';

@Injectable()
export class ProjectRepository extends Repository<Project> {
  constructor(private dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = new Project();
    project.name = createProjectDto.name;
    project.description = createProjectDto.description;
    project.status = ProjectStatus.NOT_STARTED;
    project.requirements = createProjectDto.requirements;
    project.metadata = createProjectDto.metadata;

    return this.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.find();
  }

  async findById(id: string): Promise<Project | null> {
    return this.findOne({ where: { id } });
  }
}
