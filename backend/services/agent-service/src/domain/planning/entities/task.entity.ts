import { Entity } from 'typeorm';
import { Task as SharedTask } from '@coworker/shared/database/entities/Task';
import { TaskStatus, TaskEventTypes, TaskStatusEventData, TaskAgentAssignmentEventData } from '@coworker/shared';
import { DomainEvent } from '@coworker/shared/events/definitions/DomainEvent';

@Entity()
export class Task extends SharedTask {
  // Domain-specific methods
  setStatus(newStatus: TaskStatus): void {
    if (this.status !== newStatus) {
      const eventData: TaskStatusEventData = {
        status: newStatus,
      };

      this.addDomainEvent({
        eventType: TaskEventTypes.STATUS_UPDATED,
        data: eventData,
        occurredOn: new Date(),
        aggregateId: this.id,
        version: this.version,
        toJSON: function (): Record<string, unknown> {
          return {
            eventType: TaskEventTypes.STATUS_UPDATED,
            data: eventData,
            occurredOn: new Date(),
            aggregateId: this.id,
            version: this.version,
          };
        },
      });
      this.status = newStatus;
    }
  }

  assignAgent(agentId: string): void {
    const eventData: TaskAgentAssignmentEventData = {
      agent_id: agentId,
    };

    this.addDomainEvent({
      eventType: TaskEventTypes.AGENT_ASSIGNED,
      data: eventData,
      occurredOn: new Date(),
      aggregateId: this.id,
      version: this.version,
      toJSON: function (): Record<string, unknown> {
        return {
          eventType: TaskEventTypes.AGENT_ASSIGNED,
          data: eventData,
          occurredOn: new Date(),
          aggregateId: this.id,
          version: this.version,
        };
      },
    });
  }
}
