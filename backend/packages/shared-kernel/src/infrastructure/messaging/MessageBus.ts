import { BaseError, ErrorCategory, ErrorSeverity } from '../../common/errors/BaseError';

export class MessageBusError extends BaseError {
  constructor(message: string) {
    super(message, ErrorCategory.Infrastructure, ErrorSeverity.High, true);
  }
}

export class ExternalServiceError extends BaseError {
  constructor(message: string) {
    super(message, ErrorCategory.Infrastructure, ErrorSeverity.High, true);
  }
}

export interface Message {
  id: string;
  type: string;
  payload: any;
  metadata?: Record<string, any>;
}

export interface MessageHandler {
  handle(message: Message): Promise<void>;
}

export class MessageBus {
  private handlers: Map<string, MessageHandler[]> = new Map();

  async publish(message: Message): Promise<void> {
    const handlers = this.handlers.get(message.type) || [];

    if (handlers.length === 0) {
      throw new MessageBusError(`No handlers registered for message type: ${message.type}`);
    }

    await Promise.all(
      handlers.map(handler =>
        handler.handle(message).catch(error => {
          throw new ExternalServiceError(
            `Handler failed to process message ${message.id}: ${error.message}`
          );
        })
      )
    );
  }

  subscribe(messageType: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(messageType) || [];
    handlers.push(handler);
    this.handlers.set(messageType, handlers);
  }

  unsubscribe(messageType: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(messageType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.handlers.set(messageType, handlers);
    }
  }
}
