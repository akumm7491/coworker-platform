import { QueryRunner } from 'typeorm';
import { Task } from '../entities/Task';
import { TaskStatus, TaskPriority, TaskType } from '../types/task.types';
import { Result } from '../Result';

export interface ITaskRepository {
  // Basic CRUD
  findById(id: string, queryRunner?: QueryRunner): Promise<Result<Task>>;
  findAll(queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  save(task: Task, queryRunner?: QueryRunner): Promise<Result<void>>;
  delete(id: string, queryRunner?: QueryRunner): Promise<Result<void>>;

  // Status-based queries
  findByStatus(status: TaskStatus, queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findByPriority(priority: TaskPriority, queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findByType(type: TaskType, queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findPendingTasks(queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findCompletedTasks(queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findBlockedTasks(queryRunner?: QueryRunner): Promise<Result<Task[]>>;

  // Assignment queries
  findByAssignee(agentId: string, queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findUnassignedTasks(queryRunner?: QueryRunner): Promise<Result<Task[]>>;

  // Timeline queries
  findTasksDueBy(date: Date, queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findOverdueTasks(queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findTasksInDateRange(
    startDate: Date,
    endDate: Date,
    queryRunner?: QueryRunner
  ): Promise<Result<Task[]>>;

  // Progress tracking
  getTaskProgress(taskId: string, queryRunner?: QueryRunner): Promise<Result<number>>;
  getTasksProgressByProject(
    projectId: string,
    queryRunner?: QueryRunner
  ): Promise<Result<Map<string, number>>>;

  // Dependency management
  findDependentTasks(taskId: string, queryRunner?: QueryRunner): Promise<Result<Task[]>>;
  findBlockingTasks(taskId: string, queryRunner?: QueryRunner): Promise<Result<Task[]>>;

  // Analytics
  getTaskMetrics(
    taskId: string,
    queryRunner?: QueryRunner
  ): Promise<
    Result<{
      completion_time?: number;
      code_quality?: number;
      test_coverage?: number;
      performance_score?: number;
      complexity?: number;
    }>
  >;

  getTaskDistribution(queryRunner?: QueryRunner): Promise<
    Result<{
      by_status: Record<TaskStatus, number>;
      by_priority: Record<TaskPriority, number>;
      by_type: Record<TaskType, number>;
    }>
  >;
}
