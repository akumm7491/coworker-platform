import { DomainEvent } from '../../events/DomainEvent';
import { IAuthUser, RoleName, UserId } from '../types/auth.types';

export class UserAuthenticatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly user: IAuthUser,
    public readonly timestamp: Date = new Date()
  ) {
    super('UserAuthenticatedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      user: this.user,
      timestamp: this.timestamp,
    };
  }
}

export class UserLoggedOutEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly timestamp: Date = new Date()
  ) {
    super('UserLoggedOutEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      timestamp: this.timestamp,
    };
  }
}

export class UserRolesChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly oldRoles: RoleName[],
    public readonly newRoles: RoleName[],
    public readonly timestamp: Date = new Date()
  ) {
    super('UserRolesChangedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      oldRoles: this.oldRoles,
      newRoles: this.newRoles,
      timestamp: this.timestamp,
    };
  }
}

export class UserPermissionsChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly oldPermissions: string[],
    public readonly newPermissions: string[],
    public readonly timestamp: Date = new Date()
  ) {
    super('UserPermissionsChangedEvent', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      oldPermissions: this.oldPermissions,
      newPermissions: this.newPermissions,
      timestamp: this.timestamp,
    };
  }
}

export class InvalidAuthenticationAttemptEvent extends DomainEvent {
  constructor(
    public readonly email: string,
    public readonly reason: string,
    public readonly ipAddress: string,
    public readonly timestamp: Date = new Date()
  ) {
    super('InvalidAuthenticationAttemptEvent', email);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      email: this.email,
      reason: this.reason,
      ipAddress: this.ipAddress,
      timestamp: this.timestamp,
    };
  }
}
