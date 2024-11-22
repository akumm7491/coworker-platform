import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Task } from './entities/task.entity';
import { Agent } from './entities/agent.entity';
import { Project } from './entities/project.entity';
import { Team } from './entities/team.entity';
import { TaskRepository } from './repositories/task.repository';
import { AgentRepository } from './repositories/agent.repository';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectServiceClient } from './clients/project.client';
import { TaskController } from './controllers/task.controller';
import { EventStore } from '@coworker/shared/events/store/EventStore';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Agent, Project, Team]), HttpModule],
  controllers: [TaskController],
  providers: [TaskRepository, AgentRepository, ProjectRepository, ProjectServiceClient, EventStore],
  exports: [TaskRepository, AgentRepository, ProjectRepository, ProjectServiceClient],
})
export class PlanningModule {}
