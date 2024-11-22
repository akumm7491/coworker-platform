import { eventBus } from './eventBus.js';
import { AppDataSource } from '../config/database.js';
import { Agent } from '../models/Agent.js';
import { AGENT_EVENTS } from '../controllers/agents.js';

class AgentService {
  private static instance: AgentService;
  private agentRepository = AppDataSource.getRepository(Agent);

  private constructor() {
    this.initializeEventListeners();
  }

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  private initializeEventListeners(): void {
    // Listen for agent creation
    eventBus.subscribe(AGENT_EVENTS.CREATED, async payload => {
      await this.handleAgentCreation(payload);
    });

    // Listen for agent updates
    eventBus.subscribe(AGENT_EVENTS.UPDATED, async payload => {
      await this.handleAgentUpdate(payload);
    });

    // Listen for task assignments
    eventBus.subscribe(AGENT_EVENTS.TASK_ASSIGNED, async payload => {
      await this.handleTaskAssignment(payload);
    });

    // Listen for status changes
    eventBus.subscribe(AGENT_EVENTS.STATUS_CHANGED, async payload => {
      await this.handleStatusChange(payload);
    });
  }

  private async handleAgentCreation(payload: any): Promise<void> {
    const { agentId, configuration } = payload;

    try {
      // Initialize agent's autonomous behavior based on configuration
      console.log(`Initializing agent ${agentId} with configuration:`, configuration);

      // Here you would implement the specific autonomous behavior
      // For example, starting monitoring tasks, setting up communication channels, etc.
    } catch (error) {
      console.error(`Error initializing agent ${agentId}:`, error);
    }
  }

  private async handleAgentUpdate(payload: any): Promise<void> {
    const { agentId, changes } = payload;

    try {
      // Update agent's autonomous behavior based on changes
      console.log(`Updating agent ${agentId} with changes:`, changes);

      // Implement behavior updates based on configuration changes
    } catch (error) {
      console.error(`Error updating agent ${agentId}:`, error);
    }
  }

  private async handleTaskAssignment(payload: any): Promise<void> {
    const { agentId, task } = payload;

    try {
      // Process the assigned task
      console.log(`Processing task for agent ${agentId}:`, task);

      // Implement task processing logic
      // This could include:
      // 1. Task validation
      // 2. Resource allocation
      // 3. Task execution
      // 4. Progress updates
      // 5. Result reporting

      // Example of publishing a task status update
      await eventBus.publish('agent:task_status', {
        agentId,
        taskId: task.id,
        status: 'processing',
        progress: 0,
      });
    } catch (error) {
      console.error(`Error processing task for agent ${agentId}:`, error);
    }
  }

  private async handleStatusChange(payload: any): Promise<void> {
    const { agentId, previousStatus, newStatus } = payload;

    try {
      console.log(`Agent ${agentId} status changed from ${previousStatus} to ${newStatus}`);

      // Implement status-specific behavior
      switch (newStatus) {
        case 'active':
          // Initialize active state behavior
          break;
        case 'paused':
          // Pause ongoing tasks
          break;
        case 'inactive':
          // Clean up resources
          break;
      }
    } catch (error) {
      console.error(`Error handling status change for agent ${agentId}:`, error);
    }
  }

  // Public methods for direct interaction with agents
  public async getAgentStatus(agentId: string): Promise<any> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });
    return agent ? agent.status : null;
  }

  public async executeAgentAction(agentId: string, action: string, params: any): Promise<void> {
    // Implement direct action execution
    await eventBus.publish('agent:action_requested', {
      agentId,
      action,
      params,
      timestamp: new Date().toISOString(),
    });
  }
}

export const agentService = AgentService.getInstance();
