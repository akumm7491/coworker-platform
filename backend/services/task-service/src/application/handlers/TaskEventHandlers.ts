import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { MessageBus, Message } from '@coworker/shared-kernel';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskStatusChangedEvent,
} from '../../domain/events/TaskEvents';

@Injectable()
@EventsHandler(TaskCreatedEvent)
export class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent> {
  constructor(private readonly messageBus: MessageBus) {}

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
export class TaskUpdatedHandler implements IEventHandler<TaskUpdatedEvent> {
  constructor(private readonly messageBus: MessageBus) {}

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
export class TaskStatusChangedHandler implements IEventHandler<TaskStatusChangedEvent> {
  constructor(private readonly messageBus: MessageBus) {}

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
