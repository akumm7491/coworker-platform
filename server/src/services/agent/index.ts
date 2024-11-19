import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import logger from '../../utils/logger.js';


interface AgentMessage {
  type: string;
  payload: unknown;
}

interface AgentTask {
  id: string;
  agentId: string;
  status?: 'assigned' | 'completed' | 'in_progress';
  description?: string;
}

class AgentService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'agent-service',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      ssl: process.env.NODE_ENV === 'production',
      sasl:
        process.env.NODE_ENV === 'production'
          ? {
              mechanism: 'plain',
              username: process.env.KAFKA_USERNAME || '',
              password: process.env.KAFKA_PASSWORD || '',
            }
          : undefined,
    });
  }

  async initialize(): Promise<void> {
    try {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      logger.info('Producer connected successfully');

      await this.startConsumer();
      logger.info('Consumer started successfully');
    } catch (error) {
      logger.error('Failed to initialize agent service:', error);
      throw error;
    }
  }

  private async startConsumer(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'agent-service-group' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'agent-tasks', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async payload => {
        try {
          await this.eachMessage(payload);
        } catch (error) {
          logger.error('Error processing message:', error);
        }
      },
    });
  }

  private async eachMessage({ message }: EachMessagePayload): Promise<void> {
    if (!message.value) return;

    try {
      const agentMessage: AgentMessage = JSON.parse(message.value.toString());
      await this.handleMessage(agentMessage);
    } catch (error) {
      logger.error('Failed to process message:', error);
    }
  }

  private async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'TASK_ASSIGNED':
        await this.handleTaskAssigned(message.payload as AgentTask);
        break;
      case 'TASK_COMPLETED':
        await this.handleTaskCompleted(message.payload as AgentTask);
        break;
      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  private async handleTaskAssigned(task: AgentTask): Promise<void> {
    logger.info(`Task assigned: ${task.id} to agent: ${task.agentId}`);
    // Implementation for task assignment
  }

  private async handleTaskCompleted(task: AgentTask): Promise<void> {
    logger.info(`Task completed: ${task.id} by agent: ${task.agentId}`);
    // Implementation for task completion
  }

  async assignTask(agentId: string, taskId: string): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not initialized');
    }

    const message: AgentMessage = {
      type: 'TASK_ASSIGNED',
      payload: {
        id: taskId,
        agentId,
        status: 'assigned',
      },
    };

    await this.producer.send({
      topic: 'agent-tasks',
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async completeTask(agentId: string, taskId: string): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not initialized');
    }

    const message: AgentMessage = {
      type: 'TASK_COMPLETED',
      payload: {
        id: taskId,
        agentId,
        status: 'completed',
      },
    };

    await this.producer.send({
      topic: 'agent-tasks',
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async shutdown(): Promise<void> {
    try {
      if (this.producer) {
        await this.producer.disconnect();
      }
      if (this.consumer) {
        await this.consumer.disconnect();
      }
      logger.info('Agent service shut down successfully');
    } catch (error) {
      logger.error('Error shutting down agent service:', error);
      throw error;
    }
  }
}

export const agentService = new AgentService();
