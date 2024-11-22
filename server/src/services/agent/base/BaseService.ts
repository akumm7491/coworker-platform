import { Repository, DeepPartial } from 'typeorm';
import { MetricsService } from '../../shared/metrics/MetricsService.js';
import { QueueService } from '../../shared/queue/QueueService.js';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';

export abstract class BaseService<T> {
  protected readonly logger: Logger = logger;

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityName: string,
    protected readonly serviceName: string,
    protected readonly metrics: MetricsService,
    protected readonly queue: QueueService
  ) {}

  async create(entity: DeepPartial<T>): Promise<T> {
    const savedEntity = await this.repository.save(entity);
    this.metrics.incrementCounter(`${this.serviceName}.${this.entityName}.created`);
    return savedEntity;
  }

  async findById(id: string): Promise<T | null> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      this.metrics.incrementCounter(`${this.serviceName}.${this.entityName}.not_found`);
      return null;
    }
    this.metrics.incrementCounter(`${this.serviceName}.${this.entityName}.found`);
    return entity;
  }

  async findAll(): Promise<T[]> {
    const entities = await this.repository.find();
    this.metrics.incrementCounter(`${this.serviceName}.${this.entityName}.list`);
    return entities;
  }

  async update(id: string, updates: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findById(id);
    if (!entity) {
      return null;
    }

    const updatedEntity = await this.repository.save({
      ...entity,
      ...updates,
    });

    this.metrics.incrementCounter(`${this.serviceName}.${this.entityName}.updated`);
    return updatedEntity;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      this.metrics.incrementCounter(`${this.serviceName}.${this.entityName}.delete_failed`);
      return false;
    }
    this.metrics.incrementCounter(`${this.serviceName}.${this.entityName}.deleted`);
    return true;
  }

  protected async handleError(error: Error, context: string): Promise<void> {
    this.logger.error(`Error in ${this.serviceName}.${context}: ${error.message}`, {
      error,
      service: this.serviceName,
      context,
    });
    this.metrics.incrementCounter(`${this.serviceName}.errors`, {
      context,
      error_type: error.name,
    });
  }
}
