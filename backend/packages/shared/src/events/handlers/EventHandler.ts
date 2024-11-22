import { DomainEvent } from '../definitions/DomainEvent';

export interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}
