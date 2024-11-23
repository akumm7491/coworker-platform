import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../domain/models/Task';
import { TaskRepository } from './TaskRepository';
import { TASK_REPOSITORY } from '../../constants/injection-tokens';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [
    TaskRepository,
    {
      provide: TASK_REPOSITORY,
      useFactory: (repository: TaskRepository) => repository,
      inject: [TaskRepository],
    },
  ],
  exports: [TASK_REPOSITORY, TaskRepository],
})
export class TaskRepositoryModule {}
