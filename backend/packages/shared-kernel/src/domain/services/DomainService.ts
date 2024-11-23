import { Repository } from '../repositories/Repository';

export abstract class DomainService<T> {
  constructor(protected repository: Repository<T>) {}
}
