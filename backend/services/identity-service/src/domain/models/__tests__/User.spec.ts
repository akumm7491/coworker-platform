import { User } from '../User';
import { PasswordHashingService } from '../../../application/services/PasswordHashingService';
import { AuthenticationError } from '@coworker/shared-kernel';
import { UserCreatedEvent, UserPasswordChangedEvent, UserRolesUpdatedEvent } from '../../events/UserEvents';

describe('User', () => {
  let passwordHashingService: PasswordHashingService;

  beforeEach(() => {
    passwordHashingService = new PasswordHashingService();
    jest
      .spyOn(passwordHashingService, 'hash')
      .mockImplementation(async (password: string) => `hashed_${password}`);
    jest
      .spyOn(passwordHashingService, 'compare')
      .mockImplementation(async (plain: string, hashed: string) => hashed === `hashed_${plain}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with default role', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const firstName = 'Test';
      const lastName = 'User';

      const [user, event] = await User.create(email, password, firstName, lastName, passwordHashingService);

      expect(user.getEmail()).toBe(email);
      expect(user.getRoles()).toEqual(['user']);
      expect(event).toBeInstanceOf(UserCreatedEvent);
      expect(event.email).toBe(email);
      expect(event.roles).toEqual(['user']);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'password123';
      const [user] = await User.create('test@example.com', password, 'Test', 'User', passwordHashingService);

      await expect(user.verifyPassword(password, passwordHashingService)).resolves.toBeUndefined();
    });

    it('should throw AuthenticationError for incorrect password', async () => {
      const [user] = await User.create('test@example.com', 'password123', 'Test', 'User', passwordHashingService);

      await expect(user.verifyPassword('wrongpassword', passwordHashingService)).rejects.toThrow(
        AuthenticationError
      );
    });
  });

  describe('changePassword', () => {
    it('should change password and return event', async () => {
      const newPassword = 'newpassword123';
      const [user] = await User.create('test@example.com', 'password123', 'Test', 'User', passwordHashingService);

      const event = await user.changePassword(newPassword, passwordHashingService);

      expect(event).toBeInstanceOf(UserPasswordChangedEvent);
      await expect(user.verifyPassword(newPassword, passwordHashingService)).resolves.toBeUndefined();
    });
  });

  describe('updateRoles', () => {
    it('should update roles and return event', async () => {
      const [user] = await User.create('test@example.com', 'password123', 'Test', 'User', passwordHashingService);
      const newRoles = ['admin', 'user'];

      const event = user.updateRoles(newRoles);

      expect(user.getRoles()).toEqual(newRoles);
      expect(event).toBeInstanceOf(UserRolesUpdatedEvent);
      expect(event.oldRoles).toEqual(['user']);
      expect(event.newRoles).toEqual(newRoles);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has role', async () => {
      const [user] = await User.create('test@example.com', 'password123', 'Test', 'User', passwordHashingService);
      user.updateRoles(['admin', 'user']);

      expect(user.hasRole('admin')).toBe(true);
      expect(user.hasRole('user')).toBe(true);
    });

    it('should return false if user does not have role', async () => {
      const [user] = await User.create('test@example.com', 'password123', 'Test', 'User', passwordHashingService);

      expect(user.hasRole('admin')).toBe(false);
    });
  });
});
