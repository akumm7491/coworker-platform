import { Aggregate } from './Aggregate.js';
import { Event } from '../events/types.js';
import { AgentEventTypes } from '../events/examples/AgentEvents.js';
import { z } from 'zod';

export interface AgentState {
  id: string;
  name: string;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  capabilities: string[];
  currentTasks: string[];
}

export class Agent extends Aggregate {
  private state: AgentState;

  constructor(id: string) {
    super(id);
    this.state = {
      id,
      name: '',
      status: 'OFFLINE',
      capabilities: [],
      currentTasks: [],
    };
  }

  get name(): string {
    return this.state.name;
  }

  get status(): string {
    return this.state.status;
  }

  get capabilities(): string[] {
    return [...this.state.capabilities];
  }

  get currentTasks(): string[] {
    return [...this.state.currentTasks];
  }

  protected apply(event: Event): void {
    switch (event.type) {
      case AgentEventTypes.AGENT_CREATED:
        this.applyAgentCreated(event);
        break;
      case AgentEventTypes.AGENT_UPDATED:
        this.applyAgentUpdated(event);
        break;
      case AgentEventTypes.AGENT_TASK_ASSIGNED:
        this.applyAgentTaskAssigned(event);
        break;
      case AgentEventTypes.AGENT_TASK_COMPLETED:
        this.applyAgentTaskCompleted(event);
        break;
    }
  }

  private applyAgentCreated(event: Event): void {
    const payload = event.payload as z.infer<typeof AgentCreatedPayloadSchema>;
    this.state = {
      ...this.state,
      name: payload.name,
      capabilities: payload.capabilities,
      status: 'IDLE',
    };
  }

  private applyAgentUpdated(event: Event): void {
    const payload = event.payload as any;
    this.state = {
      ...this.state,
      ...payload,
    };
  }

  private applyAgentTaskAssigned(event: Event): void {
    const payload = event.payload as z.infer<typeof AgentTaskAssignedPayloadSchema>;
    this.state.currentTasks.push(payload.taskId);
    this.state.status = 'BUSY';
  }

  private applyAgentTaskCompleted(event: Event): void {
    const payload = event.payload as { taskId: string };
    this.state.currentTasks = this.state.currentTasks.filter(id => id !== payload.taskId);
    this.state.status = this.state.currentTasks.length === 0 ? 'IDLE' : 'BUSY';
  }
}

const AgentCreatedPayloadSchema = z.object({
  name: z.string(),
  capabilities: z.array(z.string()),
});

const AgentTaskAssignedPayloadSchema = z.object({
  taskId: z.string(),
  taskType: z.string(),
});
