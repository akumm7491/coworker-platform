import { UserAggregate } from '../domain/UserAggregate';
import { Repository } from '../../domain/repositories/Repository';

export class UserRepository implements Repository<UserAggregate> {
  private users: Map<string, UserAggregate> = new Map();

  async save(entity: UserAggregate): Promise<void> {
    this.users.set(entity.id, entity);
  }

  async findById(id: string): Promise<UserAggregate | null> {
    return this.users.get(id) || null;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
