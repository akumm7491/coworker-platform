import { AgentBaseService } from '../base/AgentBaseService.js';
import { Repository } from 'typeorm';
import { AgentMetric } from '../../shared/database/entities/AgentMetric.js';
import { AgentEventType } from '../../shared/events/EventTypes.js';
import { Inject } from 'typedi';
import logger from '../../../utils/logger.js';

export class MonitoringService extends AgentBaseService<AgentMetric> {
  private static instance: MonitoringService;

  private constructor(repository: Repository<AgentMetric>) {
    super(repository, 'AgentMetric', 'monitoring');
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService(getRepository(AgentMetric));
    }
    return MonitoringService.instance;
  }

  protected setupEventHandlers(): void {
    // Subscribe to all agent events for monitoring
    Object.values(AgentEventType).forEach(eventType => {
      this.eventBus.subscribe(eventType, this.handleAgentEvent.bind(this));
    });
  }

  async recordMetric(
    agentId: string,
    type: string,
    value: number,
    metadata?: Record<string, any>,
  ): Promise<AgentMetric> {
    const metric = await this.create({
      agentId,
      type,
      value,
      metadata,
      timestamp: new Date(),
    });

    // Update metrics in monitoring system
    this.metrics.recordMetric(type, {
      agentId,
      value,
      ...metadata,
    });

    return metric;
  }

  async getAgentMetrics(
    agentId: string,
    type?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<AgentMetric[]> {
    const query = this.repository
      .createQueryBuilder('metric')
      .where('metric.agentId = :agentId', { agentId });

    if (type) {
      query.andWhere('metric.type = :type', { type });
    }

    if (startTime) {
      query.andWhere('metric.timestamp >= :startTime', { startTime });
    }

    if (endTime) {
      query.andWhere('metric.timestamp <= :endTime', { endTime });
    }

    return query.orderBy('metric.timestamp', 'DESC').getMany();
  }

  async getAggregatedMetrics(
    type: string,
    aggregation: 'sum' | 'avg' | 'min' | 'max',
    startTime?: Date,
    endTime?: Date,
  ): Promise<{ value: number; count: number }> {
    const query = this.repository
      .createQueryBuilder('metric')
      .where('metric.type = :type', { type });

    if (startTime) {
      query.andWhere('metric.timestamp >= :startTime', { startTime });
    }

    if (endTime) {
      query.andWhere('metric.timestamp <= :endTime', { endTime });
    }

    const result = await query
      .select([`${aggregation}(metric.value) as value`, 'COUNT(*) as count'])
      .getRawOne();

    return {
      value: parseFloat(result.value) || 0,
      count: parseInt(result.count) || 0,
    };
  }

  private async handleAgentEvent(event: any): Promise<void> {
    try {
      const { type, payload } = event;
      const { agentId } = payload;

      // Record event occurrence
      await this.recordMetric(agentId, `event_${type}`, 1, payload);

      // Track specific metrics based on event type
      switch (type) {
        case AgentEventType.TASK_COMPLETED:
          await this.recordMetric(agentId, 'task_duration', payload.duration || 0, payload);
          break;

        case AgentEventType.ERROR:
          await this.recordMetric(agentId, 'error_count', 1, payload);
          break;

        case AgentEventType.KNOWLEDGE_SHARED:
          await this.recordMetric(agentId, 'knowledge_transfer_size', payload.size || 0, payload);
          break;
      }
    } catch (error) {
      this.logError('Failed to handle agent event:', error);
    }
  }

  async getAgentHealth(agentId: string): Promise<{
    status: 'healthy' | 'warning' | 'error';
    metrics: Record<string, number>;
  }> {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const metrics = await this.getAgentMetrics(agentId, undefined, lastHour);

    const errorCount = metrics
      .filter(m => m.type === 'error_count')
      .reduce((sum, m) => sum + m.value, 0);

    const taskCount = metrics.filter(m => m.type === 'event_TASK_COMPLETED').length;

    const avgTaskDuration =
      metrics.filter(m => m.type === 'task_duration').reduce((sum, m) => sum + m.value, 0) /
      (taskCount || 1);

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (errorCount > 5) {
      status = 'error';
    } else if (errorCount > 0 || avgTaskDuration > 300000) {
      // 5 minutes
      status = 'warning';
    }

    return {
      status,
      metrics: {
        errorCount,
        taskCount,
        avgTaskDuration,
      },
    };
  }
}

export const monitoringService = MonitoringService.getInstance();
