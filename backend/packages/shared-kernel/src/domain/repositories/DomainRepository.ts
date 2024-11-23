import { Repository, ObjectLiteral } from 'typeorm';

export interface IDomainRepository<T extends ObjectLiteral> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  delete(id: string): Promise<void>;
}

export abstract class DomainRepository<T extends ObjectLiteral> implements IDomainRepository<T> {
  constructor(protected repository: Repository<T>) {}

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findOneBy({ id } as any);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
