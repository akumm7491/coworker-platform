import { Result } from '../../common/Result';

export class CommandHandlerNotFoundError extends Error {
  constructor(commandType: string) {
    super(`No handler registered for command ${commandType}`);
    this.name = 'CommandHandlerNotFoundError';
  }
}

export class CommandHandlingError extends Error {
  constructor(message: string) {
    super(`Command handling failed: ${message}`);
    this.name = 'CommandHandlingError';
  }
}

export interface ICommand<TResult = void> {
  readonly commandType: string;
  readonly timestamp: Date;
  readonly __resultType?: TResult; // Type marker for compile-time type checking
}

export abstract class Command<TResult = void> implements ICommand<TResult> {
  public readonly timestamp: Date;
  readonly __resultType?: TResult;

  constructor(public readonly commandType: string) {
    this.timestamp = new Date();
  }
}

export interface ICommandHandler<TCommand extends ICommand<TResult>, TResult> {
  handle(command: TCommand): Promise<Result<TResult>>;
}

export interface ICommandBus {
  dispatch<TResult>(command: ICommand<TResult>): Promise<Result<TResult>>;
  register<TCommand extends ICommand<TResult>, TResult>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>
  ): void;
}

export class CommandBus implements ICommandBus {
  private handlers: Map<string, ICommandHandler<any, any>> = new Map();

  register<TCommand extends ICommand<TResult>, TResult>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>
  ): void {
    if (this.handlers.has(commandType)) {
      throw new Error(`Handler for ${commandType} already registered`);
    }
    this.handlers.set(commandType, handler);
  }

  async dispatch<TResult>(command: ICommand<TResult>): Promise<Result<TResult>> {
    const handler = this.handlers.get(command.commandType);
    if (!handler) {
      return Result.fail(new CommandHandlerNotFoundError(command.commandType));
    }

    try {
      return await handler.handle(command);
    } catch (error) {
      return Result.fail(
        new CommandHandlingError(error instanceof Error ? error.message : String(error))
      );
    }
  }
}
