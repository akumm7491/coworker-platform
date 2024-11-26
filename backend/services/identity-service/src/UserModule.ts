import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/models/User';
import { PasswordHashingService } from './application/services/PasswordHashingService';
import { UserController } from './api/UserController';
import { UserCommandHandlers } from './application/handlers/UserCommandHandlers';
import { UserEventHandlers } from './application/handlers/UserEventHandlers';
import { UserQueryHandlers } from './application/handlers/UserQueryHandlers';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { USER_REPOSITORY } from './domain/repositories/tokens';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    PasswordHashingService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    ...UserCommandHandlers,
    ...UserEventHandlers,
    ...UserQueryHandlers,
  ],
  exports: [PasswordHashingService, USER_REPOSITORY],
})
export class UserModule {}
