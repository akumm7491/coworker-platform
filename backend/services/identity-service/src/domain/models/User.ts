import { AggregateRoot } from '@coworker/shared-kernel';
import {
  UserCreatedEvent,
  UserPasswordChangedEvent,
  UserRolesUpdatedEvent,
} from '../events/UserEvents';
import { PasswordHashingService } from '../../application/services/PasswordHashingService';
import { AuthenticationError } from '@coworker/shared-kernel/src/domain/auth';

export type UserId = string;

export interface UserProps {
  id: UserId;
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  isEmailVerified: boolean;
  socialProfiles?: {
    google?: { id: string; email: string };
    github?: { id: string; email: string };
  };
  metadata: Record<string, any>;
}

export class User extends AggregateRoot {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    super(props.id);
    this.props = props;
  }

  public static create(props: Omit<UserProps, 'id' | 'roles' | 'isEmailVerified'>): User {
    const user = new User({
      ...props,
      id: crypto.randomUUID(),
      roles: ['user'],
      isEmailVerified: false,
      metadata: props.metadata || {},
    });

    user.addDomainEvent(new UserCreatedEvent(user.id, user.email));
    return user;
  }

  public static createWithSocialProfile(
    provider: 'google' | 'github',
    profile: { id: string; email: string; firstName?: string; lastName?: string }
  ): User {
    const user = new User({
      id: crypto.randomUUID(),
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      roles: ['user'],
      isEmailVerified: true,
      socialProfiles: {
        [provider]: { id: profile.id, email: profile.email },
      },
      metadata: {},
    });

    user.addDomainEvent(new UserCreatedEvent(user.id, user.email));
    return user;
  }

  public async setPassword(
    password: string,
    passwordHashingService: PasswordHashingService
  ): Promise<void> {
    this.props.passwordHash = await passwordHashingService.hash(password);
    this.addDomainEvent(new UserPasswordChangedEvent(this.id));
  }

  public async validatePassword(
    password: string,
    passwordHashingService: PasswordHashingService
  ): Promise<boolean> {
    if (!this.props.passwordHash) {
      throw new AuthenticationError('No password set for this user');
    }
    return passwordHashingService.compare(password, this.props.passwordHash);
  }

  public updateRoles(roles: string[]): void {
    const oldRoles = [...this.props.roles];
    this.props.roles = roles;
    this.addDomainEvent(new UserRolesUpdatedEvent(this.id, oldRoles, roles));
  }

  public linkSocialProfile(
    provider: 'google' | 'github',
    profile: { id: string; email: string }
  ): void {
    this.props.socialProfiles = {
      ...this.props.socialProfiles,
      [provider]: profile,
    };
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get roles(): string[] {
    return [...this.props.roles];
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get socialProfiles() {
    return this.props.socialProfiles ? { ...this.props.socialProfiles } : undefined;
  }

  get metadata(): Record<string, any> {
    return { ...this.props.metadata };
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
