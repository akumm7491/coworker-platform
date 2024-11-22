import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectRepository } from '../repositories/project.repository';
import { Project } from '../entities/project.entity';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectRepository: ProjectRepository) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Return all projects' })
  async findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiResponse({ status: 200, description: 'Return the project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async create(@Body() project: Partial<Project>): Promise<Project> {
    return this.projectRepository.save(project);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(@Param('id') id: string, @Body() project: Partial<Project>): Promise<Project> {
    const existingProject = await this.projectRepository.findOne({ where: { id } });
    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    await this.projectRepository.update(id, project);
    return this.projectRepository.findOne({ where: { id } }) as Promise<Project>;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a project' })
  @ApiResponse({ status: 200, description: 'Project archived successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async archive(@Param('id') id: string): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    await this.projectRepository.archiveProject(id);
  }

  @Post(':id/team-members/:userId')
  @ApiOperation({ summary: 'Add a team member to a project' })
  @ApiResponse({ status: 200, description: 'Team member added successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async addTeamMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.projectRepository.addTeamMember(id, userId);
  }
}
