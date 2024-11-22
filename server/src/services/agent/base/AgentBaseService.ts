import { Repository, DeepPartial } from 'typeorm';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';
import { MetricsService } from '../../shared/metrics/MetricsService.js';
import { metricsService } from '../../shared/metrics/MetricsService.js';
import { QueueService } from '../../shared/queue/QueueService.js';
import { QueueService as QueueServiceType } from '../../shared/queue/QueueService.js';
import { EventBus } from '../../shared/events/EventBus.js';
import { eventBus } from '../../shared/events/EventBus.js';

export abstract class AgentBaseService<T> {
  protected readonly logger: Logger = logger;
  protected readonly repository: Repository<T>;
  protected readonly metrics: MetricsService;
  protected readonly queue: QueueServiceType;
  protected readonly eventBus: EventBus;
  protected readonly serviceName: string;

  constructor(repository: Repository<T>, serviceName: string) {
    this.repository = repository;
    this.serviceName = serviceName;
    this.metrics = metricsService;
    this.queue = new QueueService();
    this.eventBus = eventBus;
  }

  protected abstract setupEventHandlers(): Promise<void>;

  protected async handleError(error: Error, operation: string): Promise<void> {
    this.logger.error(`Error in ${this.serviceName}.${operation}`, { error });
    this.metrics.incrementCounter(`${this.serviceName}.errors`, {
      operation,
    });
    throw error;
  }

  public async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      const savedEntity = await this.repository.save(entity);
      this.metrics.incrementCounter(`${this.serviceName}.created`);
      return savedEntity;
    } catch (error) {
      await this.handleError(error as Error, 'create');
      throw error;
    }
  }

  public async update(id: string | number, data: DeepPartial<T>): Promise<T> {
    try {
      await this.repository.update(id, data);
      const updatedEntity = await this.repository.findOne({ where: { id } as any });
      if (!updatedEntity) {
        throw new Error(`Entity not found`);
      }
      this.metrics.incrementCounter(`${this.serviceName}.updated`);
      return updatedEntity;
    } catch (error) {
      await this.handleError(error as Error, 'update');
      throw error;
    }
  }

  public async delete(id: string | number): Promise<void> {
    try {
      const result = await this.repository.delete(id);
      if (result.affected === 0) {
        throw new Error(`Entity not found`);
      }
      this.metrics.incrementCounter(`${this.serviceName}.deleted`);
    } catch (error) {
      await this.handleError(error as Error, 'delete');
      throw error;
    }
  }

  public async findById(id: string | number): Promise<T | null> {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      this.metrics.incrementCounter(`${this.serviceName}.found`);
      return entity;
    } catch (error) {
      await this.handleError(error as Error, 'findById');
      throw error;
    }
  }

  public async findAll(): Promise<T[]> {
    try {
      const entities = await this.repository.find();
      this.metrics.incrementCounter(`${this.serviceName}.found_all`);
      return entities;
    } catch (error) {
      await this.handleError(error as Error, 'findAll');
      throw error;
    }
  }
}
