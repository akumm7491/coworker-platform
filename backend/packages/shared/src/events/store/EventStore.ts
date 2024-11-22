import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainEvent, EventData } from '../definitions/DomainEvent';
import { EventRecord } from './EventRecord';
import { UserEvent, UserEventTypes, UserEventData, UserEventType } from '../../database/entities/User';
import { ProjectEvent, ProjectEventTypes, ProjectEventData } from '../../database/entities/Project';
import { AgentEvent, AgentEventTypes, AgentEventData, AgentEventType } from '../../database/entities/Agent';
import { TaskEvent, TaskEventTypes, TaskEventData } from '../../database/entities/Task';
import { TeamEvent, TeamEventTypes, TeamEventData } from '../../database/entities/Team';

@Injectable()
export class EventStore {
    constructor(
        @InjectRepository(EventRecord)
        private readonly eventRepository: Repository<EventRecord>
    ) {}

    async saveEvent(event: DomainEvent): Promise<void> {
        const eventRecord = this.eventRepository.create({
            eventType: event.eventType,
            aggregateId: event.aggregateId,
            version: event.version,
            data: event.data
        });

        await this.eventRepository.save(eventRecord);
    }

    async saveEvents(aggregateId: string, events: DomainEvent[]): Promise<void> {
        for (const event of events) {
            await this.saveEvent(event);
        }
    }

    async getEvents(aggregateId: string): Promise<DomainEvent[]> {
        const eventRecords = await this.eventRepository.find({
            where: { aggregateId },
            order: { version: 'ASC' }
        });

        return eventRecords.map(record => this.createDomainEvent(record));
    }

    private createDomainEvent(record: EventRecord): DomainEvent {
        const eventData = record.data as EventData;

        const userEventValues = Object.values(UserEventTypes) as string[];
        if (userEventValues.includes(record.eventType)) {
            return new UserEvent(
                record.eventType as UserEventType,
                record.aggregateId,
                record.version,
                eventData as UserEventData
            );
        }

        const projectEventValues = Object.values(ProjectEventTypes) as string[];
        if (projectEventValues.includes(record.eventType)) {
            return new ProjectEvent(
                record.eventType as ProjectEventTypes,
                record.aggregateId,
                record.version,
                eventData as ProjectEventData
            );
        }

        const agentEventValues = Object.values(AgentEventTypes) as string[];
        if (agentEventValues.includes(record.eventType)) {
            return new AgentEvent(
                record.eventType as AgentEventType,
                record.aggregateId,
                record.version,
                eventData as AgentEventData
            );
        }

        const taskEventValues = Object.values(TaskEventTypes) as string[];
        if (taskEventValues.includes(record.eventType)) {
            return new TaskEvent(
                record.eventType as TaskEventTypes,
                record.aggregateId,
                record.version,
                eventData as TaskEventData
            );
        }
        
        const teamEventValues = Object.values(TeamEventTypes) as string[];
        if (teamEventValues.includes(record.eventType)) {
            return new TeamEvent(
                record.eventType as TeamEventTypes,
                record.aggregateId,
                record.version,
                eventData as TeamEventData
            );
        }

        throw new Error(`Unknown event type: ${record.eventType}`);
    }

    async getLatestVersion(aggregateId: string): Promise<number> {
        const result = await this.eventRepository
            .createQueryBuilder()
            .select('MAX(version)', 'maxVersion')
            .where('aggregateId = :aggregateId', { aggregateId })
            .getRawOne();

        return result?.maxVersion ?? 0;
    }
}
