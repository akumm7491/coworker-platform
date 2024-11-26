import {
  UserCreatedEvent,
  UserPasswordChangedEvent,
  UserRolesUpdatedEvent,
  UserSocialProfileLinkedEvent,
  UserEmailVerifiedEvent,
  PasswordResetRequestedEvent,
} from '../UserEvents';

describe('User Events', () => {
  const userId = '00000000-0000-0000-0000-000000000000';
  const timestamp = new Date('2024-01-01');

  describe('UserCreatedEvent', () => {
    it('should create event with correct properties', () => {
      const event = new UserCreatedEvent(userId, 'test@example.com', ['user']);
      const json = event.toJSON();

      expect(json).toMatchObject({
        userId,
        email: 'test@example.com',
        roles: ['user']
      });
    });
  });

  describe('UserPasswordChangedEvent', () => {
    it('should create event with correct properties', () => {
      const event = new UserPasswordChangedEvent(userId);
      const json = event.toJSON();

      expect(json).toMatchObject({
        userId
      });
    });
  });

  describe('UserRolesUpdatedEvent', () => {
    it('should create event with correct properties', () => {
      const oldRoles = ['user'];
      const newRoles = ['user', 'admin'];
      const event = new UserRolesUpdatedEvent(userId, oldRoles, newRoles);
      const json = event.toJSON();

      expect(json).toMatchObject({
        userId,
        oldRoles,
        newRoles
      });
    });
  });

  describe('UserSocialProfileLinkedEvent', () => {
    it('should create event with correct properties', () => {
      const event = new UserSocialProfileLinkedEvent(userId, 'google', 'google123');
      const json = event.toJSON();

      expect(json).toMatchObject({
        userId,
        provider: 'google',
        providerUserId: 'google123'
      });
    });
  });

  describe('UserEmailVerifiedEvent', () => {
    it('should create event with correct properties', () => {
      const event = new UserEmailVerifiedEvent(userId, 'test@example.com');
      const json = event.toJSON();

      expect(json).toMatchObject({
        userId,
        email: 'test@example.com'
      });
    });
  });

  describe('PasswordResetRequestedEvent', () => {
    it('should create event with correct properties', () => {
      const event = new PasswordResetRequestedEvent(userId, 'test@example.com', 'reset123');
      const json = event.toJSON();

      expect(json).toMatchObject({
        userId,
        email: 'test@example.com',
        resetToken: 'reset123'
      });
    });
  });
});
