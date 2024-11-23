import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { AggregateRoot } from '../base/AggregateRoot';
import { UserRole } from '../../types/auth';
import { DomainEvent, EventData, EventType } from '../../events/definitions/DomainEvent';
import * as bcrypt from 'bcrypt';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended'
}

// Local User Event Types
export type UserEventType = EventType & string;

export enum UserEventTypes {
    PROFILE_UPDATED = 'UserProfileUpdated',
    STATUS_UPDATED = 'UserStatusUpdated',
    ROLE_UPDATED = 'UserRoleUpdated',
    PREFERENCES_UPDATED = 'UserPreferencesUpdated',
    PASSWORD_CHANGED = 'UserPasswordChanged',
    EMAIL_VERIFIED = 'UserEmailVerified',
    MFA_ENABLED = 'UserMFAEnabled',
    MFA_DISABLED = 'UserMFADisabled'
}

// Event Data Interfaces
export interface UserProfileEventData extends EventData {
    name: string;
    email: string;
}

export interface UserStatusEventData extends EventData {
    status: UserStatus;
}

export interface UserRoleEventData extends EventData {
    role: UserRole;
}

export interface UserPreferencesEventData extends EventData {
    preferences: {
        theme?: string;
        notifications?: boolean;
        language?: string;
        timezone?: string;
    };
}

export interface UserPasswordEventData extends EventData {
    passwordHash: string;
}

export interface UserMFAEventData extends EventData {
    settings: {
        enabled: boolean;
        method: string;
        backup_codes: string[];
    };
}

export interface UserEmailVerifiedEventData extends EventData {
    verified: boolean;
}

// Type alias for all possible user event data types
export type UserEventData = 
    | UserProfileEventData
    | UserStatusEventData
    | UserRoleEventData
    | UserPreferencesEventData
    | UserPasswordEventData
    | UserMFAEventData
    | UserEmailVerifiedEventData;

// Type Guards
export function isUserProfileEventData(data: unknown): data is UserProfileEventData {
    const d = data as UserProfileEventData;
    return typeof d === 'object' && 
           d !== null &&
           typeof d.name === 'string' && 
           typeof d.email === 'string';
}

export function isUserStatusEventData(data: unknown): data is UserStatusEventData {
    const d = data as UserStatusEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.status === 'string' &&
           Object.values(UserStatus).includes(d.status as UserStatus);
}

export function isUserRoleEventData(data: unknown): data is UserRoleEventData {
    const d = data as UserRoleEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.role === 'string' &&
           Object.values(UserRole).includes(d.role as UserRole);
}

export function isUserPreferencesEventData(data: unknown): data is UserPreferencesEventData {
    const d = data as UserPreferencesEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.preferences === 'object' &&
           d.preferences !== null;
}

export function isUserPasswordEventData(data: unknown): data is UserPasswordEventData {
    const d = data as UserPasswordEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.passwordHash === 'string';
}

export function isUserMFAEventData(data: unknown): data is UserMFAEventData {
    const d = data as UserMFAEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.settings === 'object' &&
           d.settings !== null &&
           typeof d.settings.enabled === 'boolean' &&
           typeof d.settings.method === 'string' &&
           Array.isArray(d.settings.backup_codes) &&
           d.settings.backup_codes.every(code => typeof code === 'string');
}

export function isUserEmailVerifiedEventData(data: unknown): data is UserEmailVerifiedEventData {
    const d = data as UserEmailVerifiedEventData;
    return typeof d === 'object' &&
           d !== null &&
           typeof d.verified === 'boolean';
}

@Entity('users')
export class User extends AggregateRoot {
    @Column()
    @Index({ unique: true })
    email!: string;

    @Column()
    name!: string;

    @Column({ select: false })
    password!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    status!: UserStatus;

    @Column('jsonb', { default: {} })
    preferences!: {
        theme: string;
        notifications: boolean;
        language: string;
        timezone: string;
    };

    @Column('boolean', { default: false })
    email_verified!: boolean;

    @Column('jsonb', { nullable: true })
    mfa_settings?: {
        enabled: boolean;
        method: string;
        backup_codes: string[];
    };

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            const salt = await bcrypt.genSalt();
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    protected toDomainEvent(eventType: UserEventType, data: UserEventData): DomainEvent {
        return new UserEvent(eventType, this.id, this.version, data);
    }

    applyEvent(event: DomainEvent): void {
        const eventType = event.eventType as UserEventType;
        switch (eventType) {
            case UserEventTypes.PROFILE_UPDATED as UserEventType:
                if (isUserProfileEventData(event.data)) {
                    this.name = event.data.name;
                    this.email = event.data.email;
                }
                break;

            case UserEventTypes.STATUS_UPDATED as UserEventType:
                if (isUserStatusEventData(event.data)) {
                    this.status = event.data.status;
                }
                break;

            case UserEventTypes.ROLE_UPDATED as UserEventType:
                if (isUserRoleEventData(event.data)) {
                    this.role = event.data.role;
                }
                break;

            case UserEventTypes.PREFERENCES_UPDATED as UserEventType:
                if (isUserPreferencesEventData(event.data)) {
                    this.preferences = {
                        ...this.preferences,
                        ...event.data.preferences
                    };
                }
                break;

            case UserEventTypes.PASSWORD_CHANGED as UserEventType:
                if (isUserPasswordEventData(event.data)) {
                    this.password = event.data.passwordHash;
                }
                break;

            case UserEventTypes.EMAIL_VERIFIED as UserEventType:
                if (isUserEmailVerifiedEventData(event.data)) {
                    this.email_verified = event.data.verified;
                }
                break;

            case UserEventTypes.MFA_ENABLED as UserEventType:
            case UserEventTypes.MFA_DISABLED as UserEventType:
                if (isUserMFAEventData(event.data)) {
                    this.mfa_settings = event.data.settings;
                }
                break;
        }
    }
}

export class UserEvent extends DomainEvent {
    constructor(
        eventType: UserEventType,
        aggregateId: string,
        version: number,
        data: UserEventData
    ) {
        super(eventType, aggregateId, version, data);
    }

    toJSON(): Record<string, unknown> {
        return {
            eventType: this.eventType,
            aggregateId: this.aggregateId,
            version: this.version,
            data: this.data,
            occurredOn: this.occurredOn
        };
    }
}
