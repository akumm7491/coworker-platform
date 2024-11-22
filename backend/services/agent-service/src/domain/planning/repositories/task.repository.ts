import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository as TypeORMRepository, Raw, DeepPartial } from 'typeorm';
import { Task as DomainTask } from '../entities/task.entity';
import { Task as SharedTask, TaskStatus, TaskPriority, TaskType } from '@coworker/shared';
import { BaseRepository } from '@coworker/shared/database/repositories/interfaces/BaseRepository';
import { TaskRepository as ITaskRepository } from '@coworker/shared/types/database/repository';
import { EventStore } from '@coworker/shared/events/store/EventStore';
import { Agent } from '../entities/agent.entity';

// Internal repository for domain operations
class InternalTaskRepository extends BaseRepository<DomainTask> {
  constructor(
    repository: TypeORMRepository<DomainTask>,
    entityManager: EntityManager,
    eventStore: EventStore
  ) {
    super(repository, entityManager, eventStore);
  }
}

@Injectable()
export class TaskRepository implements ITaskRepository {
  private internalRepository: InternalTaskRepository;

  constructor(
    @InjectRepository(DomainTask)
    private readonly taskRepository: TypeORMRepository<DomainTask>,
    @InjectRepository(Agent)
    private readonly agentRepository: TypeORMRepository<Agent>,
    protected readonly entityManager: EntityManager,
    protected readonly eventStore: EventStore
  ) {
    this.internalRepository = new InternalTaskRepository(taskRepository, entityManager, eventStore);
  }

  private transformTaskToShared(taskEntity: DomainTask): SharedTask {
    const {
      id,
      name,
      description,
      status,
      priority,
      type,
      progress,
      requirements,
      dependencies,
      execution_plan,
      validation_results,
      metrics,
      metadata,
      tags,
      createdAt,
      updatedAt,
    } = taskEntity;

    return {
      id,
      name,
      description,
      status,
      priority,
      type,
      progress,
      requirements,
      dependencies,
      execution_plan,
      validation_results,
      metrics,
      metadata,
      tags,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }

  async findById(id: string): Promise<SharedTask | null> {
    const task = await this.internalRepository.findById(id);
    return task ? this.transformTaskToShared(task) : null;
  }

  async findAll(): Promise<SharedTask[]> {
    const tasks = await this.internalRepository.findAll();
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async findByIds(ids: string[]): Promise<SharedTask[]> {
    const tasks = await this.internalRepository.findByIds(ids);
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async save(entity: SharedTask): Promise<SharedTask> {
    const domainTask = new DomainTask();
    Object.assign(domainTask, entity);
    const savedTask = await this.internalRepository.save(domainTask);
    return this.transformTaskToShared(savedTask);
  }

  async update(id: string, entityData: Partial<SharedTask>): Promise<SharedTask> {
    const domainTask = await this.internalRepository.findById(id);
    if (!domainTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    Object.assign(domainTask, entityData);
    const savedTask = await this.internalRepository.save(domainTask);
    return this.transformTaskToShared(savedTask);
  }

  async delete(id: string): Promise<void> {
    await this.internalRepository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return !!(await this.internalRepository.findById(id));
  }

  async beginTransaction(): Promise<void> {
    await this.internalRepository.beginTransaction();
  }

  async commitTransaction(): Promise<void> {
    await this.internalRepository.commitTransaction();
  }

  async rollbackTransaction(): Promise<void> {
    await this.internalRepository.rollbackTransaction();
  }

  async withTransaction<R>(operation: () => Promise<R>): Promise<R> {
    return this.internalRepository.withTransaction(operation);
  }

  async getEvents(id: string): Promise<import('@coworker/shared/events/definitions/DomainEvent').DomainEvent[]> {
    return this.internalRepository.getEvents(id);
  }

  async saveEvents(id: string, events: import('@coworker/shared/events/definitions/DomainEvent').DomainEvent[]): Promise<void> {
    await this.internalRepository.saveEvents(id, events);
  }

  async replay(id: string): Promise<SharedTask> {
    const task = await this.internalRepository.replay(id);
    return this.transformTaskToShared(task);
  }

  async query(criteria: Record<string, unknown>): Promise<SharedTask[]> {
    const tasks = await this.taskRepository.find({ where: criteria });
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async count(criteria: Record<string, unknown>): Promise<number> {
    return this.taskRepository.count({ where: criteria });
  }

  async paginate(
    page: number,
    limit: number,
    criteria?: Record<string, unknown>
  ): Promise<{
    items: SharedTask[];
    total: number;
    page: number;
    pages: number;
  }> {
    const [items, total] = await this.taskRepository.findAndCount({
      where: criteria,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map(task => this.transformTaskToShared(task)),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findByStatus(status: TaskStatus): Promise<SharedTask[]> {
    const tasks = await this.taskRepository.find({ where: { status } });
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async findByPriority(priority: TaskPriority): Promise<SharedTask[]> {
    const tasks = await this.taskRepository.find({ where: { priority } });
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async findByType(type: TaskType): Promise<SharedTask[]> {
    const tasks = await this.taskRepository.find({ where: { type } });
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async findByProject(projectId: string): Promise<SharedTask[]> {
    const tasks = await this.taskRepository.find({ where: { project: { id: projectId } } });
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async findByAssignedAgent(agentId: string): Promise<SharedTask[]> {
    const tasks = await this.taskRepository.find({ where: { assigned_agents: { id: agentId } } });
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async findByDependency(taskId: string): Promise<SharedTask[]> {
    const tasks = await this.taskRepository.find({
      where: {
        dependencies: Raw(alias => `${alias}->>'tasks' ? '${taskId}'`),
      },
    });
    return tasks.map(task => this.transformTaskToShared(task));
  }

  async assignToAgent(taskId: string, agentId: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['assigned_agents'],
    });
    if (!task) throw new Error(`Task with id ${taskId} not found`);
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) throw new Error(`Agent with id ${agentId} not found`);
    if (!task.assigned_agents) task.assigned_agents = [];
    task.assigned_agents.push(agent);
    await this.taskRepository.save(task);
  }
}
