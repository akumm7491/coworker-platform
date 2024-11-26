import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/models/User';
import { PasswordHashingService } from '../services/PasswordHashingService';
import { CreateUserCommand } from '../commands/CreateUserCommand';
import { UpdateUserRolesCommand } from '../commands/UpdateUserRolesCommand';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordHashingService: PasswordHashingService
  ) {}

  async execute(command: CreateUserCommand) {
    const [user] = await User.create(
      command.email,
      command.password,
      command.firstName,
      command.lastName,
      this.passwordHashingService
    );
    return this.userRepository.save(user);
  }
}

@CommandHandler(UpdateUserRolesCommand)
export class UpdateUserRolesHandler implements ICommandHandler<UpdateUserRolesCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async execute(command: UpdateUserRolesCommand) {
    const user = await this.userRepository.findOne({ where: { id: command.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const event = user.updateRoles(command.roles);
    await this.userRepository.save(user);
    return event;
  }
}

export const UserCommandHandlers = [CreateUserHandler, UpdateUserRolesHandler];
