import { Counter, Gauge, Histogram, Registry } from 'prom-client';
import { Service } from 'typedi';
import { Logger } from 'winston';
import logger from '../../../utils/logger.js';

@Service()
export class MetricsService {
  private readonly registry: Registry;
  private readonly metrics: Map<string, Counter<string> | Gauge<string> | Histogram<string>>;
  private readonly logger: Logger;

  constructor() {
    this.registry = new Registry();
    this.metrics = new Map();
    this.logger = logger;
  }

  public incrementCounter(name: string, labels: Record<string, string> = {}): void {
    const metric = this.getOrCreateMetric(name, 'counter');
    if (metric instanceof Counter) {
      metric.inc(labels);
    } else {
      this.logger.error(`Metric ${name} is not a counter`);
    }
  }

  public increment(name: string, labels: Record<string, string> = {}): void {
    this.incrementCounter(name, labels);
  }

  public setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric = this.getOrCreateMetric(name, 'gauge');
    if (metric instanceof Gauge) {
      metric.set(labels, value);
    } else {
      this.logger.error(`Metric ${name} is not a gauge`);
    }
  }

  public observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric = this.getOrCreateMetric(name, 'histogram');
    if (metric instanceof Histogram) {
      metric.observe(labels, value);
    } else {
      this.logger.error(`Metric ${name} is not a histogram`);
    }
  }

  private getOrCreateMetric(
    name: string,
    type: 'counter' | 'gauge' | 'histogram',
  ): Counter<string> | Gauge<string> | Histogram<string> {
    const existingMetric = this.metrics.get(name);
    if (existingMetric) {
      return existingMetric;
    }

    let metric: Counter<string> | Gauge<string> | Histogram<string>;
    switch (type) {
      case 'counter':
        metric = new Counter({
          name,
          help: `Counter metric ${name}`,
          registers: [this.registry],
        });
        break;
      case 'gauge':
        metric = new Gauge({
          name,
          help: `Gauge metric ${name}`,
          registers: [this.registry],
        });
        break;
      case 'histogram':
        metric = new Histogram({
          name,
          help: `Histogram metric ${name}`,
          registers: [this.registry],
        });
        break;
      default:
        throw new Error(`Invalid metric type: ${type}`);
    }

    this.metrics.set(name, metric);
    return metric;
  }

  public getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  public clearMetrics(): void {
    this.registry.clear();
    this.metrics.clear();
  }
}

export const metricsService = new MetricsService();
