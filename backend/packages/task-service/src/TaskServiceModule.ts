import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Task } from './domain/entities/Task';
import { TaskController } from './application/controllers/TaskController';
import { TaskRepository } from './infrastructure/persistence/TaskRepository';

// Command Handlers
import {
  CreateTaskCommandHandler,
  AssignTaskCommandHandler,
  UpdateTaskStatusCommandHandler,
  UpdateTaskProgressCommandHandler,
  DeleteTaskCommandHandler,
} from './application/commands/handlers';

// Query Handlers
import { GetTaskQueryHandler, GetTasksQueryHandler } from './application/queries/handlers';

// Event Handlers
import {
  TaskCreatedHandler,
  TaskUpdatedHandler,
  TaskDeletedHandler,
} from './application/events/handlers';

const CommandHandlers = [
  CreateTaskCommandHandler,
  AssignTaskCommandHandler,
  UpdateTaskStatusCommandHandler,
  UpdateTaskProgressCommandHandler,
  DeleteTaskCommandHandler,
];

const QueryHandlers = [GetTaskQueryHandler, GetTasksQueryHandler];

const EventHandlers = [TaskCreatedHandler, TaskUpdatedHandler, TaskDeletedHandler];

@Module({
  imports: [
    ConfigModule.forRoot(),
    CqrsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('POSTGRES_URL'),
        entities: [Task],
        synchronize: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Task]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'task-service',
              brokers: configService.get<string>('KAFKA_BROKERS').split(','),
            },
            consumer: {
              groupId: 'task-service-consumer',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [
    // Command Handlers
    ...CommandHandlers,

    // Query Handlers
    ...QueryHandlers,

    // Event Handlers
    ...EventHandlers,

    // Repositories
    {
      provide: 'ITaskRepository',
      useClass: TaskRepository,
    },
  ],
})
export class TaskServiceModule {}
