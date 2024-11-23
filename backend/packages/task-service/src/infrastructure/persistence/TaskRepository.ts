import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { Task } from '../../domain/entities/Task';
import { 
  BaseDomainRepository,
  Result,
  BaseError,
  EntityNotFoundError,
  InfrastructureError,
  RetryStrategy
} from '@coworker-platform/shared-kernel';
import { IEventBus } from '@coworker-platform/shared-kernel/dist/domain/events/EventBus';
import { Logger } from '@coworker-platform/shared-kernel/dist/observability/Logger';

@Injectable()
export class TaskRepository extends BaseDomainRepository<Task> {
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
    private readonly eventBus: IEventBus,
  ) {
    // Pass retry strategy options if needed
    const retryStrategy = new RetryStrategy({
      maxAttempts: 3,
      backoff: {
        startingDelay: 100,
        maximumDelay: 1000,
        factor: 2,
      },
    });
    super(dataSource, eventBus);
  }

  async findById(id: string, queryRunner?: QueryRunner): Promise<Result<Task, BaseError>> {
    return this.withRetryAndTransaction(async qr => {
      try {
        const repo = qr?.manager.getRepository(Task) ?? this.taskRepository;
        const task = await repo.findOne({ where: { id } });

        if (!task) {
          return Result.fail(new EntityNotFoundError('Task', id));
        }

        return Result.ok(task);
      } catch (error) {
        this.logger.error('Failed to find task by ID', error as Error, { taskId: id });
        return Result.fail(new InfrastructureError(
          `Failed to find task: ${error instanceof Error ? error.message : String(error)}`,
          'TASK_FIND_ERROR'
        ));
      }
    });
  }

  async findAll(queryRunner?: QueryRunner): Promise<Result<Task[], BaseError>> {
    return this.withRetryAndTransaction(async qr => {
      try {
        const repo = qr?.manager.getRepository(Task) ?? this.taskRepository;
        const tasks = await repo.find();
        return Result.ok(tasks);
      } catch (error) {
        this.logger.error('Failed to find all tasks', error as Error);
        return Result.fail(new InfrastructureError(
          `Failed to find tasks: ${error instanceof Error ? error.message : String(error)}`,
          'TASK_FIND_ALL_ERROR'
        ));
      }
    });
  }

  async save(entity: Task, queryRunner?: QueryRunner): Promise<Result<Task, BaseError>> {
    return this.withRetryAndTransaction(async qr => {
      try {
        const repo = qr?.manager.getRepository(Task) ?? this.taskRepository;
        const savedTask = await repo.save(entity);
        await this.publishEvents(entity);
        return Result.ok(savedTask);
      } catch (error) {
        this.logger.error('Failed to save task', error as Error, { taskId: entity.id });
        return Result.fail(new InfrastructureError(
          `Failed to save task: ${error instanceof Error ? error.message : String(error)}`,
          'TASK_SAVE_ERROR'
        ));
      }
    });
  }

  async delete(id: string, queryRunner?: QueryRunner): Promise<Result<void, BaseError>> {
    return this.withRetryAndTransaction(async qr => {
      try {
        const repo = qr?.manager.getRepository(Task) ?? this.taskRepository;
        const deleteResult = await repo.delete(id);
        
        if (deleteResult.affected === 0) {
          return Result.fail(new EntityNotFoundError('Task', id));
        }

        return Result.ok();
      } catch (error) {
        this.logger.error('Failed to delete task', error as Error, { taskId: id });
        return Result.fail(new InfrastructureError(
          `Failed to delete task: ${error instanceof Error ? error.message : String(error)}`,
          'TASK_DELETE_ERROR'
        ));
      }
    });
  }

  // Add task-specific query methods here
  async findByAssignee(assigneeId: string): Promise<Result<Task[], BaseError>> {
    return this.withRetryAndTransaction(async qr => {
      try {
        const repo = qr?.manager.getRepository(Task) ?? this.taskRepository;
        const tasks = await repo.find({ where: { assigneeId } });
        return Result.ok(tasks);
      } catch (error) {
        this.logger.error('Failed to find tasks by assignee', error as Error, { assigneeId });
        return Result.fail(new InfrastructureError(
          `Failed to find tasks by assignee: ${error instanceof Error ? error.message : String(error)}`,
          'TASK_FIND_BY_ASSIGNEE_ERROR'
        ));
      }
    });
  }
}
