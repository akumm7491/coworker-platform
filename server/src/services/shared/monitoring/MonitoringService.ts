import { Service } from 'typedi';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';
import { MetricsService } from '../metrics/MetricsService.js';
import { metricsService } from '../metrics/MetricsService.js';
import { NotificationService } from '../notification/NotificationService.js';
import { notificationService } from '../notification/NotificationService.js';
import { EventBus } from '../events/EventBus.js';
import { eventBus } from '../events/EventBus.js';

interface HealthCheck {
  id: string;
  name: string;
  type: string;
  interval: number;
  timeout: number;
  endpoint?: string;
  query?: string;
  threshold?: number;
  status: 'up' | 'down' | 'degraded';
  lastCheck: Date;
  nextCheck: Date;
  metadata?: Record<string, unknown>;
}

interface Alert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  acknowledged: boolean;
  resolvedAt?: Date;
}

interface Threshold {
  id: string;
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  duration?: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
}

@Service()
export class MonitoringService {
  private static instance: MonitoringService;
  private readonly logger: Logger = logger;
  private readonly metrics: MetricsService;
  private readonly notifications: NotificationService;
  private readonly eventBus: EventBus;
  private readonly healthChecks: Map<string, HealthCheck> = new Map();
  private readonly alerts: Map<string, Alert> = new Map();
  private readonly thresholds: Map<string, Threshold> = new Map();
  private readonly checkIntervals: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private constructor() {
    this.metrics = metricsService;
    this.notifications = notificationService;
    this.eventBus = eventBus;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.subscribe('health.check.created', this.handleHealthCheckCreated.bind(this));
    this.eventBus.subscribe('health.check.updated', this.handleHealthCheckUpdated.bind(this));
    this.eventBus.subscribe('health.check.deleted', this.handleHealthCheckDeleted.bind(this));
    this.eventBus.subscribe('threshold.created', this.handleThresholdCreated.bind(this));
    this.eventBus.subscribe('threshold.updated', this.handleThresholdUpdated.bind(this));
    this.eventBus.subscribe('threshold.deleted', this.handleThresholdDeleted.bind(this));
  }

  public async createHealthCheck(check: Omit<HealthCheck, 'id' | 'status' | 'lastCheck' | 'nextCheck'>): Promise<HealthCheck> {
    const id = crypto.randomUUID();
    const now = new Date();
    const healthCheck: HealthCheck = {
      ...check,
      id,
      status: 'up',
      lastCheck: now,
      nextCheck: new Date(now.getTime() + check.interval),
    };

    this.healthChecks.set(id, healthCheck);
    this.scheduleHealthCheck(healthCheck);
    await this.eventBus.publish('health.check.created', { check: healthCheck });
    return healthCheck;
  }

  private scheduleHealthCheck(check: HealthCheck): void {
    const existingInterval = this.checkIntervals.get(check.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const interval = setInterval(async () => {
      await this.runHealthCheck(check);
    }, check.interval);

    this.checkIntervals.set(check.id, interval);
  }

  private async runHealthCheck(check: HealthCheck): Promise<void> {
    try {
      const startTime = Date.now();
      let status: 'up' | 'down' | 'degraded' = 'up';

      switch (check.type) {
        case 'http':
          status = await this.runHttpCheck(check);
          break;
        case 'tcp':
          status = await this.runTcpCheck(check);
          break;
        case 'metric':
          status = await this.runMetricCheck(check);
          break;
        default:
          this.logger.warn(`Unknown health check type: ${check.type}`);
          status = 'down';
      }

      const duration = Date.now() - startTime;
      const now = new Date();

      const updatedCheck = {
        ...check,
        status,
        lastCheck: now,
        nextCheck: new Date(now.getTime() + check.interval),
      };

      this.healthChecks.set(check.id, updatedCheck);
      this.metrics.incrementCounter('monitoring.health_checks', {
        type: check.type,
        status,
      });
      this.metrics.recordValue('monitoring.health_check_duration', duration, {
        type: check.type,
      });

      if (status !== 'up') {
        await this.createAlert({
          type: 'health_check',
          severity: status === 'down' ? 'error' : 'warning',
          message: `Health check ${check.name} is ${status}`,
          source: check.name,
          metadata: {
            checkId: check.id,
            checkType: check.type,
            duration,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error running health check', {
        error,
        check,
      });
      this.metrics.incrementCounter('monitoring.health_check_errors', {
        type: check.type,
      });
    }
  }

  private async runHttpCheck(check: HealthCheck): Promise<'up' | 'down' | 'degraded'> {
    if (!check.endpoint) {
      throw new Error('HTTP health check requires an endpoint');
    }

    try {
      const response = await fetch(check.endpoint, {
        timeout: check.timeout,
      });

      if (!response.ok) {
        return 'down';
      }

      const responseTime = parseInt(response.headers.get('x-response-time') || '0', 10);
      return responseTime > (check.threshold || 1000) ? 'degraded' : 'up';
    } catch (error) {
      this.logger.error('HTTP health check failed', {
        error,
        check,
      });
      return 'down';
    }
  }

  private async runTcpCheck(check: HealthCheck): Promise<'up' | 'down' | 'degraded'> {
    // TCP check implementation would go here
    return 'up';
  }

  private async runMetricCheck(check: HealthCheck): Promise<'up' | 'down' | 'degraded'> {
    if (!check.query) {
      throw new Error('Metric health check requires a query');
    }

    try {
      const value = await this.metrics.getMetrics(check.query);
      if (typeof value !== 'number') {
        return 'down';
      }

      if (check.threshold && value > check.threshold) {
        return 'degraded';
      }

      return 'up';
    } catch (error) {
      this.logger.error('Metric health check failed', {
        error,
        check,
      });
      return 'down';
    }
  }

  public async createAlert(data: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Promise<Alert> {
    const id = crypto.randomUUID();
    const alert: Alert = {
      ...data,
      id,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.set(id, alert);
    await this.eventBus.publish('alert.created', { alert });

    switch (alert.severity) {
      case 'critical':
        await this.notifications.send({
          title: 'Critical Alert',
          message: alert.message,
          priority: 'high',
          recipients: ['admin'],
          metadata: alert.metadata,
        });
        break;
      case 'error':
        await this.notifications.send({
          title: 'Error Alert',
          message: alert.message,
          priority: 'medium',
          recipients: ['admin'],
          metadata: alert.metadata,
        });
        break;
      case 'warning':
        await this.notifications.send({
          title: 'Warning Alert',
          message: alert.message,
          priority: 'low',
          recipients: ['admin'],
          metadata: alert.metadata,
        });
        break;
      case 'info':
        await this.notifications.send({
          title: 'Info Alert',
          message: alert.message,
          priority: 'low',
          recipients: ['admin'],
          metadata: alert.metadata,
        });
        break;
    }

    return alert;
  }

  private async handleHealthCheckCreated(event: Event): Promise<void> {
    const check = event.payload.check as HealthCheck;
    this.healthChecks.set(check.id, check);
    this.scheduleHealthCheck(check);
  }

  private async handleHealthCheckUpdated(event: Event): Promise<void> {
    const check = event.payload.check as HealthCheck;
    this.healthChecks.set(check.id, check);
    this.scheduleHealthCheck(check);
  }

  private async handleHealthCheckDeleted(event: Event): Promise<void> {
    const checkId = event.payload.checkId as string;
    const interval = this.checkIntervals.get(checkId);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(checkId);
    }
    this.healthChecks.delete(checkId);
  }

  private async handleThresholdCreated(event: Event): Promise<void> {
    const threshold = event.payload.threshold as Threshold;
    this.thresholds.set(threshold.id, threshold);
  }

  private async handleThresholdUpdated(event: Event): Promise<void> {
    const threshold = event.payload.threshold as Threshold;
    this.thresholds.set(threshold.id, threshold);
  }

  private async handleThresholdDeleted(event: Event): Promise<void> {
    const thresholdId = event.payload.thresholdId as string;
    this.thresholds.delete(thresholdId);
  }
}
