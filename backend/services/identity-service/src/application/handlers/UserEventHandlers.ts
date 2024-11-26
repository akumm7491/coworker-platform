import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent, UserRolesUpdatedEvent } from '../../domain/events/UserEvents';
import { Logger } from '@nestjs/common';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  handle(event: UserCreatedEvent) {
    this.logger.log(`User created: ${event.email}`);
  }
}

@EventsHandler(UserRolesUpdatedEvent)
export class UserRolesUpdatedHandler implements IEventHandler<UserRolesUpdatedEvent> {
  private readonly logger = new Logger(UserRolesUpdatedHandler.name);

  handle(event: UserRolesUpdatedEvent) {
    this.logger.log(`User roles updated for ${event.userId}: ${event.newRoles.join(', ')}`);
  }
}

export const UserEventHandlers = [UserCreatedHandler, UserRolesUpdatedHandler];
