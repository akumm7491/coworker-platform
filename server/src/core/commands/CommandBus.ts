import { Logger } from 'winston';
import { Command, CommandBus as ICommandBus, CommandHandler } from './types.js';
import { EventBus } from '../events/EventBus.js';

export class CommandBus implements ICommandBus {
  private handlers: Map<string, CommandHandler>;

  constructor(
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {
    this.handlers = new Map();
  }

  async dispatch<T>(command: Command<T>): Promise<void> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.type}`);
    }

    try {
      this.logger.info('Dispatching command', { commandType: command.type, commandId: command.id });
      await handler.handle(command);
      this.logger.info('Command handled successfully', {
        commandType: command.type,
        commandId: command.id,
      });
    } catch (error) {
      this.logger.error('Error handling command', {
        commandType: command.type,
        commandId: command.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  register(commandType: string, handler: CommandHandler): void {
    if (this.handlers.has(commandType)) {
      throw new Error(`Handler already registered for command type: ${commandType}`);
    }
    this.handlers.set(commandType, handler);
    this.logger.info('Registered command handler', { commandType });
  }
}
