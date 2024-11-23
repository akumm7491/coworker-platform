import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProjectVision } from '@coworker/shared/types/agent';
import { Project } from '../../domain/aggregates/project.aggregate';
import { IProjectRepository } from '@coworker/shared/database/repositories/interfaces/IProjectRepository';
import { v4 as uuidv4 } from 'uuid';

export class CreateProjectCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly vision: ProjectVision
  ) {}
}

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    const { name, description, vision } = command;
    
    // Create new project using domain factory method
    const project = Project.create(
      uuidv4(),
      name,
      description,
      vision
    );

    // Persist the project
    await this.projectRepository.save(project);

    return project;
  }
}
