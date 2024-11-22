import { Service } from 'typedi';
import { Redis } from 'ioredis';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';
import { MetricsService } from '../metrics/MetricsService.js';
import { metricsService } from '../metrics/MetricsService.js';

@Service()
export class QueueService {
  private static instance: QueueService;
  private readonly logger: Logger = logger;
  private readonly metrics: MetricsService;
  private readonly client: Redis;

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    };

    this.client = new Redis(redisConfig);
    this.metrics = metricsService;
  }

  public async enqueue<T>(queueName: string, data: T): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      await this.client.rpush(queueName, serializedData);
      this.metrics.incrementCounter('queue.enqueued', { queue: queueName });
    } catch (error) {
      this.logger.error('Error enqueueing data', {
        error,
        queue: queueName,
      });
      this.metrics.incrementCounter('queue.enqueue_failed', { queue: queueName });
      throw error;
    }
  }

  public async dequeue<T>(queueName: string): Promise<T | null> {
    try {
      const data = await this.client.lpop(queueName);
      if (!data) {
        return null;
      }

      this.metrics.incrementCounter('queue.dequeued', { queue: queueName });
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error('Error dequeuing data', {
        error,
        queue: queueName,
      });
      this.metrics.incrementCounter('queue.dequeue_failed', { queue: queueName });
      throw error;
    }
  }

  public async peek<T>(queueName: string): Promise<T | null> {
    try {
      const data = await this.client.lindex(queueName, 0);
      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error('Error peeking queue', {
        error,
        queue: queueName,
      });
      throw error;
    }
  }

  public async getLength(queueName: string): Promise<number> {
    try {
      return await this.client.llen(queueName);
    } catch (error) {
      this.logger.error('Error getting queue length', {
        error,
        queue: queueName,
      });
      throw error;
    }
  }

  public async clear(queueName: string): Promise<void> {
    try {
      await this.client.del(queueName);
      this.metrics.incrementCounter('queue.cleared', { queue: queueName });
    } catch (error) {
      this.logger.error('Error clearing queue', {
        error,
        queue: queueName,
      });
      throw error;
    }
  }

  public async subscribe<T>(
    queueName: string,
    handler: (data: T) => Promise<void>,
  ): Promise<void> {
    try {
      while (true) {
        const data = await this.dequeue<T>(queueName);
        if (data) {
          try {
            await handler(data);
            this.metrics.incrementCounter('queue.processed', {
              queue: queueName,
            });
          } catch (error) {
            this.logger.error('Error processing queue item', {
              error,
              queue: queueName,
            });
            this.metrics.incrementCounter('queue.process_failed', {
              queue: queueName,
            });
          }
        }
        // Add a small delay to prevent tight loop
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      this.logger.error('Error in queue subscription', {
        error,
        queue: queueName,
      });
      throw error;
    }
  }
}
