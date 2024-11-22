import { BaseEntity } from './BaseEntity';
import { DomainEvent } from '../../events/definitions/DomainEvent';

export abstract class AggregateRoot extends BaseEntity {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  abstract applyEvent(event: DomainEvent): void;
}
