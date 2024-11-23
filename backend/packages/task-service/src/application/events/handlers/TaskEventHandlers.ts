import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
} from '../../../domain/events/task/TaskEvents';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
@EventsHandler(TaskCreatedEvent)
export class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent> {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async handle(event: TaskCreatedEvent) {
    // Publish the event to Kafka for other services
    this.kafkaClient.emit('task.created', {
      taskId: event.taskId,
      title: event.title,
      assignedTeamId: event.assignedTeamId,
      assignedAgentId: event.assignedAgentId,
      timestamp: new Date().toISOString(),
    });
  }
}

@Injectable()
@EventsHandler(TaskUpdatedEvent)
export class TaskUpdatedHandler implements IEventHandler<TaskUpdatedEvent> {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async handle(event: TaskUpdatedEvent) {
    // Publish the event to Kafka for other services
    this.kafkaClient.emit('task.updated', {
      taskId: event.taskId,
      changes: event.changes,
      timestamp: new Date().toISOString(),
    });
  }
}

@Injectable()
@EventsHandler(TaskDeletedEvent)
export class TaskDeletedHandler implements IEventHandler<TaskDeletedEvent> {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async handle(event: TaskDeletedEvent) {
    // Publish the event to Kafka for other services
    this.kafkaClient.emit('task.deleted', {
      taskId: event.taskId,
      timestamp: new Date().toISOString(),
    });
  }
}
