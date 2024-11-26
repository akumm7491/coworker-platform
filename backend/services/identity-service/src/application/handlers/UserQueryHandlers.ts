import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/models/User';
import { GetUserByIdQuery } from '../queries/GetUserByIdQuery';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async execute(query: GetUserByIdQuery) {
    const user = await this.userRepository.findOne({ where: { id: query.userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

export const UserQueryHandlers = [GetUserByIdHandler];
