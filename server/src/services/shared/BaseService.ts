import { Repository, FindOptionsWhere } from 'typeorm';
import { AppError } from '../../middleware/error.js';
import logger from '../../utils/logger.js';
import { eventBus } from '../eventBus.js';

export abstract class BaseService<T extends { id: string }> {
  protected logger = logger;
  protected eventBus = eventBus;

  constructor(
    protected repository: Repository<T>,
    protected entityName: string,
  ) {}

  protected async findById(id: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw new AppError(`${this.entityName} not found`, 404);
    }

    return entity;
  }

  protected async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  protected async findAll(where?: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where });
  }

  protected async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data);
    await this.repository.save(entity as T);

    await this.publishEvent('created', entity);
    return entity as T;
  }

  protected async update(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.findById(id);
    Object.assign(entity, data);
    await this.repository.save(entity);

    await this.publishEvent('updated', entity);
    return entity;
  }

  protected async delete(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.repository.remove(entity);

    await this.publishEvent('deleted', { id });
  }

  protected async publishEvent(
    action: 'created' | 'updated' | 'deleted',
    payload: any,
  ): Promise<void> {
    const eventType = `${this.entityName.toLowerCase()}:${action}`;
    try {
      await this.eventBus.publish(eventType, {
        ...payload,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Failed to publish ${eventType} event:`, error);
    }
  }

  protected logInfo(message: string, meta?: any): void {
    this.logger.info(`[${this.entityName}Service] ${message}`, meta);
  }

  protected logError(message: string, error?: any): void {
    this.logger.error(`[${this.entityName}Service] ${message}`, error);
  }

  protected logWarning(message: string, meta?: any): void {
    this.logger.warn(`[${this.entityName}Service] ${message}`, meta);
  }

  protected logDebug(message: string, meta?: any): void {
    this.logger.debug(`[${this.entityName}Service] ${message}`, meta);
  }

  protected async handleError(error: any): Promise<never> {
    this.logError('An error occurred:', error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('An unexpected error occurred. Please try again later.', 500);
  }
}
