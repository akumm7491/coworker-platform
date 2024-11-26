import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { DomainEvent } from '@coworker/shared-kernel';

@Injectable()
export class EventEmitter {
  private eventEmitter: EventEmitter2;

  constructor() {
    this.eventEmitter = new EventEmitter2({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    });
  }

  emit(event: DomainEvent): void {
    this.eventEmitter.emit(event.constructor.name, event);
  }

  on(eventName: string, listener: (event: DomainEvent) => void): void {
    this.eventEmitter.on(eventName, listener);
  }
}
