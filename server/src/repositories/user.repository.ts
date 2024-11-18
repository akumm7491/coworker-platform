import { Repository } from 'typeorm';
import { User, UserProvider } from '../models/User';
import { AppDataSource } from '../config/typeorm';

interface CreateUserData {
  email: string;
  name: string;
  provider: UserProvider;
  googleId?: string;
  avatar?: string;
  password?: string;
}

export class UserRepository extends Repository<User> {
  async createUser(userData: CreateUserData): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.findOne({ where: { googleId } });
  }
}

export const userRepository = AppDataSource.getRepository(User).extend(new UserRepository());
