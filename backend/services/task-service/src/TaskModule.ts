import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageBus } from '@coworker/shared-kernel';
import { typeOrmConfig } from './config/typeorm.config';

import { Task } from './domain/models/Task';
import { TaskRepository } from './infrastructure/persistence/TaskRepository';
import { CreateTaskCommandHandler } from './application/handlers/TaskCommandHandlers';
import { UpdateTaskCommandHandler } from './application/handlers/TaskCommandHandlers';
import { GetTaskQueryHandler } from './application/handlers/TaskQueryHandlers';
import { ListTasksQueryHandler } from './application/handlers/TaskQueryHandlers';
import {
  TaskCreatedHandler,
  TaskUpdatedHandler,
  TaskStatusChangedHandler,
} from './application/handlers/TaskEventHandlers';
import { TaskController } from './interfaces/http/TaskController';

const CommandHandlers = [CreateTaskCommandHandler, UpdateTaskCommandHandler];
const QueryHandlers = [GetTaskQueryHandler, ListTasksQueryHandler];
const EventHandlers = [TaskCreatedHandler, TaskUpdatedHandler, TaskStatusChangedHandler];
const Repositories = [TaskRepository];

@Module({
  imports: [CqrsModule, TypeOrmModule.forRoot(typeOrmConfig), TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [MessageBus, ...CommandHandlers, ...QueryHandlers, ...EventHandlers, ...Repositories],
  exports: [TaskRepository],
})
export class TaskModule {}
