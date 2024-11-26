import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { PasswordHashingService } from '../../application/services/PasswordHashingService';
import {
  UserCreatedEvent,
  UserPasswordChangedEvent,
  UserRolesUpdatedEvent,
} from '../events/UserEvents';
import { AuthenticationError } from '@coworker/shared-kernel';

export type UserId = string;

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: UserId;

  @Column({ unique: true })
  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @Column()
  @ApiProperty({ description: 'The first name of the user' })
  firstName: string;

  @Column()
  @ApiProperty({ description: 'The last name of the user' })
  lastName: string;

  @Column()
  private hashedPassword: string;

  @Column('simple-array')
  @ApiProperty({ description: 'The roles assigned to the user' })
  roles: string[];

  @Column('simple-array')
  @ApiProperty({ description: 'The permissions assigned to the user' })
  permissions: string[] = [];

  @Column({ default: false })
  @ApiProperty({ description: 'Whether the user email is verified' })
  isEmailVerified: boolean;

  constructor(
    id: UserId | undefined,
    email: string,
    hashedPassword: string,
    firstName: string,
    lastName: string,
    roles: string[] = ['user'],
    permissions: string[] = [],
    isEmailVerified = false
  ) {
    this.id = id || crypto.randomUUID();
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.firstName = firstName;
    this.lastName = lastName;
    this.roles = roles;
    this.permissions = permissions;
    this.isEmailVerified = isEmailVerified;
  }

  get password(): string {
    return this.hashedPassword;
  }

  getEmail(): string {
    return this.email;
  }

  getRoles(): string[] {
    return [...this.roles];
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  async verifyPassword(plainPassword: string, passwordHashingService: PasswordHashingService): Promise<void> {
    const isValid = await passwordHashingService.compare(plainPassword, this.hashedPassword);
    if (!isValid) {
      throw new AuthenticationError('Invalid password');
    }
  }

  async changePassword(newPassword: string, passwordHashingService: PasswordHashingService): Promise<UserPasswordChangedEvent> {
    this.hashedPassword = await passwordHashingService.hash(newPassword);
    return new UserPasswordChangedEvent(this.id);
  }

  updatePassword(newHashedPassword: string): UserPasswordChangedEvent {
    this.hashedPassword = newHashedPassword;
    return new UserPasswordChangedEvent(this.id);
  }

  updateRoles(newRoles: string[]): UserRolesUpdatedEvent {
    const oldRoles = [...this.roles];
    this.roles = [...newRoles];
    return new UserRolesUpdatedEvent(this.id, oldRoles, newRoles);
  }

  static async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    passwordHashingService: PasswordHashingService
  ): Promise<[User, UserCreatedEvent]> {
    const hashedPassword = await passwordHashingService.hash(password);
    const user = new User(undefined, email, hashedPassword, firstName, lastName, ['user']);
    const event = new UserCreatedEvent(user.id, email, user.roles);
    return [user, event];
  }
}
