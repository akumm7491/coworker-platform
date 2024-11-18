export enum EventType {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',
  USER_EMAIL_VERIFIED = 'USER_EMAIL_VERIFIED',
  OAUTH_ACCOUNT_LINKED = 'OAUTH_ACCOUNT_LINKED',
  OAUTH_ACCOUNT_UNLINKED = 'OAUTH_ACCOUNT_UNLINKED',
}

export interface EventMetadata {
  userId?: string;
  timestamp: number;
  version: number;
}

export interface Event<T = Record<string, unknown>> {
  id: string;
  type: EventType;
  aggregateId: string;
  aggregateType: string;
  data: T;
  metadata: EventMetadata;
}

export interface UserRegisteredEvent
  extends Event<{
    email: string;
    name: string;
    hashedPassword?: string;
    provider?: 'local' | 'google' | 'github';
    providerId?: string;
  }> {
  type: EventType.USER_REGISTERED;
}

export interface UserUpdatedEvent
  extends Event<{
    name?: string;
    email?: string;
    hashedPassword?: string;
  }> {
  type: EventType.USER_UPDATED;
}

export interface UserDeletedEvent
  extends Event<{
    reason?: string;
  }> {
  type: EventType.USER_DELETED;
}

export interface UserLoggedInEvent
  extends Event<{
    provider: 'local' | 'google' | 'github';
  }> {
  type: EventType.USER_LOGGED_IN;
}

export interface UserLoggedOutEvent extends Event<Record<string, never>> {
  type: EventType.USER_LOGGED_OUT;
}

export interface UserEmailVerifiedEvent
  extends Event<{
    userId: string;
  }> {
  type: EventType.USER_EMAIL_VERIFIED;
}

export interface OAuthAccountLinkedEvent
  extends Event<{
    provider: 'google' | 'github';
    providerId: string;
    email: string;
  }> {
  type: EventType.OAUTH_ACCOUNT_LINKED;
}

export interface OAuthAccountUnlinkedEvent
  extends Event<{
    provider: 'google' | 'github';
    providerId: string;
  }> {
  type: EventType.OAUTH_ACCOUNT_UNLINKED;
}

export type DomainEvent =
  | UserRegisteredEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | UserEmailVerifiedEvent
  | OAuthAccountLinkedEvent
  | OAuthAccountUnlinkedEvent;
