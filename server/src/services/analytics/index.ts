import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import logger from '../../utils/logger.js';

interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

class AnalyticsService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private readonly topic = 'analytics-events';
  private readonly groupId = 'analytics-service';

  constructor() {
    this.kafka = new Kafka({
      clientId: 'analytics-service',
      brokers: ['localhost:9092'], // Update this with your Kafka broker addresses
    });
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize producer
      this.producer = this.kafka.producer();
      await this.producer.connect();
      logger.info('Analytics producer connected');

      // Initialize consumer
      this.consumer = this.kafka.consumer({ groupId: this.groupId });
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: this.topic });
      logger.info('Analytics consumer connected and subscribed');

      // Start consuming messages
      await this.startConsumer();
    } catch (error) {
      logger.error('Failed to initialize analytics service:', error);
      throw error;
    }
  }

  private async startConsumer(): Promise<void> {
    if (!this.consumer) {
      throw new Error('Consumer not initialized');
    }

    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload): Promise<void> => {
        try {
          if (!message.value) return;

          const event: AnalyticsEvent = JSON.parse(message.value.toString());
          await this.processEvent(event);
        } catch (error) {
          logger.error('Error processing analytics event:', error);
        }
      },
    });
  }

  private async processEvent(event: AnalyticsEvent): Promise<void> {
    // Implement your event processing logic here
    // For example, store in database, generate metrics, etc.
    logger.info(`Processing analytics event: ${event.type}`, {
      timestamp: event.timestamp,
      data: event.data,
    });
  }

  async trackEvent(type: string, data: Record<string, unknown>): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not initialized');
    }

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    try {
      await this.producer.send({
        topic: this.topic,
        messages: [
          {
            value: JSON.stringify(event),
          },
        ],
      });
      logger.info(`Analytics event tracked: ${type}`);
    } catch (error) {
      logger.error('Failed to track analytics event:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      if (this.producer) {
        await this.producer.disconnect();
        logger.info('Analytics producer disconnected');
      }
      if (this.consumer) {
        await this.consumer.disconnect();
        logger.info('Analytics consumer disconnected');
      }
    } catch (error) {
      logger.error('Error shutting down analytics service:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
