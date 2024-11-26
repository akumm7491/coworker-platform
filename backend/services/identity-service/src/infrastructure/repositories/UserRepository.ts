import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findBySocialProfile(provider: string, profileId: string): Promise<User | null> {
    return this.repository.createQueryBuilder('user')
      .innerJoinAndSelect('user.socialProfiles', 'profile')
      .where('profile.provider = :provider', { provider })
      .andWhere('profile.profileId = :profileId', { profileId })
      .getOne();
  }

  async save(user: User): Promise<void> {
    await this.repository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      await this.repository.remove(user);
    }
  }
}
