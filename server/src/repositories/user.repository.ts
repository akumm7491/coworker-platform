import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User, UserProvider } from '../models/User.js';
import { AppDataSource } from '../config/typeorm.js';
import logger from '../utils/logger.js';


interface CreateUserData {
  email: string;
  name: string;
  provider: UserProvider;
  googleId?: string;
  avatar?: string;
  password?: string;
}

class CustomUserRepository {
  private repository: Repository<User>;

  constructor(repository: Repository<User>) {
    this.repository = repository;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const user = this.repository.create({
        ...userData,
        password: userData.password ? await bcrypt.hash(userData.password, 10) : undefined,
      });
      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { email } });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { googleId } });
    } catch (error) {
      logger.error('Error finding user by Google ID:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      logger.error('Error finding user by id:', error);
      throw error;
    }
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      logger.error('Error finding user by id with password:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      await this.repository.update(id, updateData);
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async save(user: User): Promise<User> {
    try {
      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error saving user:', error);
      throw error;
    }
  }
}

// Create and export the repository instance
const baseRepository = AppDataSource.getRepository(User);
export const userRepository = new CustomUserRepository(baseRepository);
