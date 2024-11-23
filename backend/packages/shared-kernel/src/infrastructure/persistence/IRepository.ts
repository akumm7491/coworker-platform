import { Result } from '../../common/Result';
import { BaseError } from '../../common/errors/BaseError';
import { RetryStrategy } from '../../common/retry/RetryStrategy';

export interface RepositoryOptions {
  retryStrategy?: RetryStrategy;
  cacheable?: boolean;
  cacheExpiration?: number;
}

/**
 * Base repository interface for infrastructure layer
 * Provides technology-agnostic persistence operations
 */
export interface IRepository<T> {
  /**
   * Find an entity by its ID
   * @param id The entity ID
   */
  findById(id: string): Promise<Result<T, BaseError>>;

  /**
   * Find all entities
   */
  findAll(): Promise<Result<T[], BaseError>>;

  /**
   * Save a new entity
   * @param entity The entity to save
   */
  save(entity: T): Promise<Result<T, BaseError>>;

  /**
   * Update an existing entity
   * @param entity The entity to update
   */
  update(entity: T): Promise<Result<T, BaseError>>;

  /**
   * Delete an entity by its ID
   * @param id The entity ID
   */
  delete(id: string): Promise<Result<void, BaseError>>;
}
