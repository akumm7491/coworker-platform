import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository as TypeORMRepository } from 'typeorm';
import { Agent } from '../entities/Agent';
import { AgentRole, AgentStatus } from '../../types/agent';
import { BaseRepository } from './interfaces/BaseRepository';
import { AgentRepository as IAgentRepository } from '../../types/database/repository';

@Injectable()
export class AgentRepository extends BaseRepository<Agent> implements IAgentRepository {
    constructor(
        @InjectRepository(Agent)
        repository: TypeORMRepository<Agent>,
        entityManager: EntityManager
    ) {
        super(repository, entityManager);
    }

    async findByCapabilities(capabilities: string[]): Promise<Agent[]> {
        return this.repository
            .createQueryBuilder('agent')
            .where('agent.capabilities && ARRAY[:...capabilities]', { capabilities })
            .getMany();
    }

    async findByRole(role: AgentRole): Promise<Agent[]> {
        return this.repository.find({ where: { role } });
    }

    async findByStatus(status: AgentStatus): Promise<Agent[]> {
        return this.repository.find({ where: { status } });
    }

    async findByProject(projectId: string): Promise<Agent[]> {
        return this.repository
            .createQueryBuilder('agent')
            .innerJoin('agent.projects', 'project')
            .where('project.id = :projectId', { projectId })
            .getMany();
    }

    async findByTeam(teamId: string): Promise<Agent[]> {
        return this.repository
            .createQueryBuilder('agent')
            .innerJoin('agent.teams', 'team')
            .where('team.id = :teamId', { teamId })
            .getMany();
    }
}
