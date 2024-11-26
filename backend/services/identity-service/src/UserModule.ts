import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/models/User';
import { PasswordHashingService } from './application/services/PasswordHashingService';
import { UserController } from './api/UserController';
import { UserCommandHandlers } from './application/handlers/UserCommandHandlers';
import { UserEventHandlers } from './application/handlers/UserEventHandlers';
import { UserQueryHandlers } from './application/handlers/UserQueryHandlers';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    PasswordHashingService,
    ...UserCommandHandlers,
    ...UserEventHandlers,
    ...UserQueryHandlers,
  ],
  exports: [PasswordHashingService],
})
export class UserModule {}
