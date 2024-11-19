import { EntityRepository, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User, UserProvider } from '../models/User.js';
import logger from '../utils/logger.js';


@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.findOne({ where: { email } });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return this.findOne({ where: { id } });
    } catch (error) {
      logger.error('Error finding user by id:', error);
      throw error;
    }
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    try {
      return this.findOne({
        where: { id },
        select: ['id', 'email', 'password'],
      });
    } catch (error) {
      logger.error('Error finding user by id with password:', error);
      throw error;
    }
  }

  async createUser(data: {
    name: string;
    email: string;
    password?: string;
    provider?: UserProvider;
    googleId?: string;
    githubId?: string;
    avatar?: string;
  }): Promise<User> {
    try {
      const user = this.create();
      user.name = data.name;
      user.email = data.email;
      user.provider = data.provider || UserProvider.LOCAL;
      user.googleId = data.googleId;
      user.githubId = data.githubId;
      user.avatar = data.avatar;

      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(data.password, salt);
      }

      return this.save(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      avatar?: string;
      provider?: UserProvider;
    },
  ): Promise<User> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      if (data.name) user.name = data.name;
      if (data.email) user.email = data.email;
      if (data.avatar) user.avatar = data.avatar;
      if (data.provider) user.provider = data.provider;

      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(data.password, salt);
      }

      return this.save(user);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<User> {
    try {
      const user = await this.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      user.googleId = googleId;
      return this.save(user);
    } catch (error) {
      logger.error('Error linking Google account:', error);
      throw error;
    }
  }

  async linkGithubAccount(userId: string, githubId: string): Promise<User> {
    try {
      const user = await this.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      user.githubId = githubId;
      return this.save(user);
    } catch (error) {
      logger.error('Error linking GitHub account:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.findOne({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      await this.remove(user);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
}
