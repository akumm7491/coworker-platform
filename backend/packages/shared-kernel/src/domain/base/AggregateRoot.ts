import { Entity } from './Entity';
import { DomainEvent } from '../events/DomainEvent';

export abstract class AggregateRoot extends Entity {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }
}
