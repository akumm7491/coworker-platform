import { AggregateRoot } from '../shared-kernel/src/domain/base/AggregateRoot';
import { Result } from '../Result';
import {
  AgentStatus,
  AgentRole,
  AgentPerformance,
  AgentLearningModel,
  AgentWorkingMemory,
  AgentCommunication,
} from '../types/agent.types';
import {
  AgentCreatedEvent,
  AgentStatusUpdatedEvent,
  AgentRoleUpdatedEvent,
  AgentCapabilitiesUpdatedEvent,
  AgentPerformanceUpdatedEvent,
  AgentLearningModelUpdatedEvent,
  AgentWorkingMemoryUpdatedEvent,
  AgentCommunicationUpdatedEvent,
  AgentAssignedEvent,
  AgentUnassignedEvent,
} from '../events/agent.events';

export class Agent extends AggregateRoot {
  private _name: string;
  private _description: string;
  private _status: AgentStatus;
  private _role: AgentRole;
  private _capabilities: string[];
  private _performance: AgentPerformance;
  private _learningModel: AgentLearningModel;
  private _workingMemory: AgentWorkingMemory;
  private _communication: AgentCommunication;
  private _currentAssignments: Map<string, 'project' | 'task'>;

  private constructor(id: string, name: string, description: string, role: AgentRole) {
    super(id);
    this._name = name;
    this._description = description;
    this._role = role;
    this._status = AgentStatus.IDLE;
    this._capabilities = [];
    this._currentAssignments = new Map();
    this._performance = {
      tasks_completed: 0,
      avg_completion_time: 0,
      success_rate: 0,
      quality_score: 0,
      collaboration_score: 0,
    };
    this._learningModel = {
      model_type: '',
      parameters: {},
      training_data: [],
      version: '1.0',
    };
    this._workingMemory = {
      context: {},
      short_term: [],
      long_term: [],
    };
    this._communication = {
      style: 'professional',
      preferences: {},
      history: [],
    };
  }

  public static create(
    id: string,
    name: string,
    description: string,
    role: AgentRole
  ): Result<Agent> {
    if (!name || name.trim().length === 0) {
      return Result.fail('Agent name is required');
    }
    if (!description || description.trim().length === 0) {
      return Result.fail('Agent description is required');
    }

    const agent = new Agent(id, name, description, role);
    agent.addDomainEvent(new AgentCreatedEvent(id, name, description, role));
    return Result.ok(agent);
  }

  // Status Management
  public updateStatus(status: AgentStatus): Result<void> {
    const oldStatus = this._status;
    this._status = status;
    this.addDomainEvent(new AgentStatusUpdatedEvent(this.id, oldStatus, status));
    return Result.ok();
  }

  // Role Management
  public updateRole(role: AgentRole): Result<void> {
    const oldRole = this._role;
    this._role = role;
    this.addDomainEvent(new AgentRoleUpdatedEvent(this.id, oldRole, role));
    return Result.ok();
  }

  // Capability Management
  public addCapability(capability: string): Result<void> {
    if (!this._capabilities.includes(capability)) {
      this._capabilities.push(capability);
      this.addDomainEvent(new AgentCapabilitiesUpdatedEvent(this.id, this._capabilities));
    }
    return Result.ok();
  }

  public removeCapability(capability: string): Result<void> {
    this._capabilities = this._capabilities.filter(c => c !== capability);
    this.addDomainEvent(new AgentCapabilitiesUpdatedEvent(this.id, this._capabilities));
    return Result.ok();
  }

  // Assignment Management
  public assign(entityId: string, entityType: 'project' | 'task'): Result<void> {
    if (this._status === AgentStatus.OFFLINE) {
      return Result.fail('Cannot assign offline agent');
    }

    this._currentAssignments.set(entityId, entityType);
    this._status = AgentStatus.BUSY;
    this.addDomainEvent(new AgentAssignedEvent(this.id, entityId, entityType));
    return Result.ok();
  }

  public unassign(entityId: string): Result<void> {
    this._currentAssignments.delete(entityId);
    if (this._currentAssignments.size === 0) {
      this._status = AgentStatus.IDLE;
    }
    this.addDomainEvent(new AgentUnassignedEvent(this.id, entityId));
    return Result.ok();
  }

  // Performance Management
  public updatePerformance(performance: AgentPerformance): Result<void> {
    this._performance = performance;
    this.addDomainEvent(new AgentPerformanceUpdatedEvent(this.id, performance));
    return Result.ok();
  }

  // Learning Model Management
  public updateLearningModel(model: AgentLearningModel): Result<void> {
    this._learningModel = model;
    this.addDomainEvent(new AgentLearningModelUpdatedEvent(this.id, model));
    return Result.ok();
  }

  // Working Memory Management
  public updateWorkingMemory(memory: AgentWorkingMemory): Result<void> {
    this._workingMemory = memory;
    this.addDomainEvent(new AgentWorkingMemoryUpdatedEvent(this.id, memory));
    return Result.ok();
  }

  // Communication Management
  public updateCommunication(communication: AgentCommunication): Result<void> {
    this._communication = communication;
    this.addDomainEvent(new AgentCommunicationUpdatedEvent(this.id, communication));
    return Result.ok();
  }

  // Getters
  public get name(): string {
    return this._name;
  }
  public get description(): string {
    return this._description;
  }
  public get status(): AgentStatus {
    return this._status;
  }
  public get role(): AgentRole {
    return this._role;
  }
  public get capabilities(): string[] {
    return [...this._capabilities];
  }
  public get performance(): AgentPerformance {
    return { ...this._performance };
  }
  public get learningModel(): AgentLearningModel {
    return { ...this._learningModel };
  }
  public get workingMemory(): AgentWorkingMemory {
    return { ...this._workingMemory };
  }
  public get communication(): AgentCommunication {
    return { ...this._communication };
  }
  public get currentAssignments(): Map<string, 'project' | 'task'> {
    return new Map(this._currentAssignments);
  }
}
