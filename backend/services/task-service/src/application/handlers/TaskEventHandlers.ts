import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessageBus, MessageHandler, Message } from '@coworker/shared-kernel';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskStatusChangedEvent,
  TaskDeletedEvent,
} from '../../domain/events/TaskEvents';

@Injectable()
@EventsHandler(TaskCreatedEvent)
export class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent>, OnModuleInit {
  private messageHandler: MessageHandler;

  constructor(private readonly messageBus: MessageBus) {
    this.messageHandler = {
      handle: async (message: Message) => {
        console.log('TaskCreatedEvent handled:', message.payload);
      },
    };
  }

  onModuleInit() {
    this.messageBus.subscribe('task.created', this.messageHandler);
  }

  async handle(event: TaskCreatedEvent): Promise<void> {
    const message: Message = {
      id: event.aggregateId,
      type: 'task.created',
      payload: {
        taskId: event.taskId,
        title: event.title,
        createdById: event.createdById,
        assigneeId: event.assigneeId,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'task-service',
      },
    };
    await this.messageBus.publish(message);
  }
}

@Injectable()
@EventsHandler(TaskUpdatedEvent)
export class TaskUpdatedHandler implements IEventHandler<TaskUpdatedEvent>, OnModuleInit {
  private messageHandler: MessageHandler;

  constructor(private readonly messageBus: MessageBus) {
    this.messageHandler = {
      handle: async (message: Message) => {
        console.log('TaskUpdatedEvent handled:', message.payload);
      },
    };
  }

  onModuleInit() {
    this.messageBus.subscribe('task.updated', this.messageHandler);
  }

  async handle(event: TaskUpdatedEvent): Promise<void> {
    const message: Message = {
      id: event.aggregateId,
      type: 'task.updated',
      payload: {
        taskId: event.taskId,
        updates: event.updates,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'task-service',
      },
    };
    await this.messageBus.publish(message);
  }
}

@Injectable()
@EventsHandler(TaskStatusChangedEvent)
export class TaskStatusChangedHandler
  implements IEventHandler<TaskStatusChangedEvent>, OnModuleInit
{
  private messageHandler: MessageHandler;

  constructor(private readonly messageBus: MessageBus) {
    this.messageHandler = {
      handle: async (message: Message) => {
        console.log('TaskStatusChangedEvent handled:', message.payload);
      },
    };
  }

  onModuleInit() {
    this.messageBus.subscribe('task.status_changed', this.messageHandler);
  }

  async handle(event: TaskStatusChangedEvent): Promise<void> {
    const message: Message = {
      id: event.aggregateId,
      type: 'task.status_changed',
      payload: {
        taskId: event.taskId,
        newStatus: event.newStatus,
        previousStatus: event.previousStatus,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'task-service',
      },
    };
    await this.messageBus.publish(message);
  }
}

@Injectable()
@EventsHandler(TaskDeletedEvent)
export class TaskDeletedHandler implements IEventHandler<TaskDeletedEvent>, OnModuleInit {
  private messageHandler: MessageHandler;

  constructor(private readonly messageBus: MessageBus) {
    this.messageHandler = {
      handle: async (message: Message) => {
        console.log('TaskDeletedEvent handled:', message.payload);
      },
    };
  }

  onModuleInit() {
    this.messageBus.subscribe('task.deleted', this.messageHandler);
  }

  async handle(event: TaskDeletedEvent): Promise<void> {
    const message: Message = {
      id: event.aggregateId,
      type: 'task.deleted',
      payload: {
        taskId: event.taskId,
        deletedAt: event.deletedAt,
        deletedById: event.deletedById,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'task-service',
      },
    };
    await this.messageBus.publish(message);
  }
}
