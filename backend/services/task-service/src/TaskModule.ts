import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MessageBus } from '@coworker/shared-kernel';

import { Task } from './domain/models/Task';
import {
  CreateTaskCommandHandler,
  UpdateTaskCommandHandler,
  DeleteTaskCommandHandler,
} from './application/handlers/TaskCommandHandlers';
import {
  GetTaskQueryHandler,
  ListTasksQueryHandler,
} from './application/handlers/TaskQueryHandlers';
import {
  TaskCreatedHandler,
  TaskUpdatedHandler,
  TaskStatusChangedHandler,
  TaskDeletedHandler,
} from './application/handlers/TaskEventHandlers';
import { TaskController } from './interfaces/http/TaskController';
import { TaskRepositoryModule } from './infrastructure/persistence/TaskRepositoryModule';

const CommandHandlers = [
  CreateTaskCommandHandler,
  UpdateTaskCommandHandler,
  DeleteTaskCommandHandler,
];
const QueryHandlers = [GetTaskQueryHandler, ListTasksQueryHandler];
const EventHandlers = [
  TaskCreatedHandler,
  TaskUpdatedHandler,
  TaskStatusChangedHandler,
  TaskDeletedHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Task]),
    EventEmitterModule.forRoot(),
    TaskRepositoryModule,
  ],
  controllers: [TaskController],
  providers: [
    {
      provide: MessageBus,
      useFactory: () => {
        const messageBus = new MessageBus();
        return messageBus;
      },
    },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class TaskModule {}
