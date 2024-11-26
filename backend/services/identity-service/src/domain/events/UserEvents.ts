import { DomainEvent } from '@coworker/shared-kernel';
import { UserId } from '../models/User';

export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: string,
    public readonly roles: string[],
    public readonly timestamp: Date = new Date()
  ) {
    super('UserCreatedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      roles: this.roles,
      timestamp: this.timestamp,
    };
  }
}

export class UserPasswordChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly timestamp: Date = new Date()
  ) {
    super('UserPasswordChangedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      userId: this.userId,
      timestamp: this.timestamp,
    };
  }
}

export class UserRolesUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly oldRoles: string[],
    public readonly newRoles: string[],
    public readonly timestamp: Date = new Date()
  ) {
    super('UserRolesUpdatedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      userId: this.userId,
      oldRoles: this.oldRoles,
      newRoles: this.newRoles,
      timestamp: this.timestamp,
    };
  }
}

export class UserSocialProfileLinkedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly provider: 'google' | 'github',
    public readonly providerUserId: string,
    public readonly timestamp: Date = new Date()
  ) {
    super('UserSocialProfileLinkedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      userId: this.userId,
      provider: this.provider,
      providerUserId: this.providerUserId,
      timestamp: this.timestamp,
    };
  }
}

export class UserEmailVerifiedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: string,
    public readonly timestamp: Date = new Date()
  ) {
    super('UserEmailVerifiedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      timestamp: this.timestamp,
    };
  }
}

export class PasswordResetRequestedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: string,
    public readonly resetToken: string,
    public readonly timestamp: Date = new Date()
  ) {
    super('PasswordResetRequestedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      resetToken: this.resetToken,
      timestamp: this.timestamp,
    };
  }
}
