import { RedisCache } from '../cache/RedisCache';
import { Repository } from 'typeorm';
import { BaseError, ErrorCategory, ErrorSeverity } from '../../common/errors/BaseError';

export abstract class BaseRepository<T extends { id: string }> {
  protected readonly cache: RedisCache;

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly cacheTTL: number = 3600
  ) {
    this.cache = new RedisCache();
  }

  protected getCacheKey(id: string): string {
    return `${this.constructor.name}:${id}`;
  }

  async findById(id: string): Promise<T | null> {
    try {
      // Try cache first
      const cached = await this.cache.get<T>(this.getCacheKey(id));
      if (cached) {
        return cached;
      }

      // If not in cache, get from database
      const entity = await this.repository.findOneBy({ id } as any);
      if (entity) {
        await this.cache.set(this.getCacheKey(id), entity, this.cacheTTL);
      }

      return entity || null;
    } catch (error) {
      throw new BaseError(
        `Failed to find entity by ID: ${error}`,
        ErrorCategory.Infrastructure,
        ErrorSeverity.High,
        true
      );
    }
  }

  async save(entity: T): Promise<T> {
    try {
      const saved = await this.repository.save(entity);
      await this.cache.set(this.getCacheKey(entity.id), saved, this.cacheTTL);
      return saved;
    } catch (error) {
      throw new BaseError(
        `Failed to save entity: ${error}`,
        ErrorCategory.Infrastructure,
        ErrorSeverity.High,
        true
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      await this.cache.delete(this.getCacheKey(id));
    } catch (error) {
      throw new BaseError(
        `Failed to delete entity: ${error}`,
        ErrorCategory.Infrastructure,
        ErrorSeverity.High,
        true
      );
    }
  }
}
