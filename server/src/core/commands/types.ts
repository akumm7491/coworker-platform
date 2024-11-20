import { z } from 'zod';

export interface Command<T = unknown> {
  id: string;
  type: string;
  payload: T;
  metadata: CommandMetadata;
}

export interface CommandMetadata {
  userId: string;
  timestamp: string;
  correlationId?: string;
  causationId?: string;
}

export interface CommandHandler<T = unknown> {
  handle(command: Command<T>): Promise<void>;
}

export interface CommandBus {
  dispatch<T>(command: Command<T>): Promise<void>;
  register(commandType: string, handler: CommandHandler): void;
}
