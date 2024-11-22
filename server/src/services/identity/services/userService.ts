import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserProvider } from '@/services/identity/models/User.js';
import { AppError } from '@/middleware/error.js';
import { eventBus } from '@/services/eventBus.js';
import logger from '@/utils/logger.js';

interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  provider: UserProvider;
}

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async createUser({ email, password, name, provider }: CreateUserParams): Promise<User> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      provider,
    });

    try {
      await this.userRepository.save(user);

      // Emit user created event
      eventBus.emit('user.created', { userId: user.id, email: user.email });

      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new AppError(500, 'Error creating user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await this.userRepository.update(userId, { password: hashedPassword });

      // Emit password updated event
      eventBus.emit('user.password.updated', { userId: user.id });
    } catch (error) {
      logger.error('Error updating password:', error);
      throw new AppError(500, 'Error updating password');
    }
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    try {
      await this.userRepository.delete(userId);

      // Emit user deleted event
      eventBus.emit('user.deleted', { userId: user.id });
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw new AppError(500, 'Error deleting user');
    }
  }
}
