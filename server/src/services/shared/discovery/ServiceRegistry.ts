import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { cacheService } from '../cache/CacheService.js';
import logger from '../../../utils/logger.js';

export interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping';
  metadata: {
    startTime: string;
    lastHeartbeat: string;
    endpoints: string[];
    [key: string]: any;
  };
}

export interface ServiceQuery {
  name?: string;
  version?: string;
  status?: ServiceInstance['status'];
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private redisClient: Redis;
  private readonly keyPrefix = 'service-registry:';
  private readonly heartbeatInterval = 30000; // 30 seconds
  private readonly ttl = 60; // 60 seconds
  private localInstance?: ServiceInstance;
  private heartbeatTimer?: NodeJS.Timer;

  private constructor() {
    this.initialize();
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  private async initialize(): Promise<void> {
    this.redisClient = await cacheService.createClient('service-registry');
    this.setupHeartbeatMonitoring();
  }

  private async setupHeartbeatMonitoring(): Promise<void> {
    const subscriber = await cacheService.createClient('service-registry-sub');
    subscriber.subscribe('service:heartbeat', err => {
      if (err) {
        logger.error('Error subscribing to heartbeat channel:', err);
        return;
      }
      logger.info('Subscribed to heartbeat channel');
    });

    subscriber.on('message', async (channel, message) => {
      if (channel === 'service:heartbeat') {
        try {
          const instance = JSON.parse(message) as ServiceInstance;
          await this.updateInstanceHeartbeat(instance.id);
        } catch (error) {
          logger.error('Error processing heartbeat:', error);
        }
      }
    });
  }

  async registerService(service: Omit<ServiceInstance, 'id'>): Promise<ServiceInstance> {
    const instance: ServiceInstance = {
      ...service,
      id: uuidv4(),
      status: 'starting',
      metadata: {
        ...service.metadata,
        startTime: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString(),
      },
    };

    await this.redisClient.setex(
      `${this.keyPrefix}${instance.id}`,
      this.ttl,
      JSON.stringify(instance),
    );

    this.localInstance = instance;
    this.startHeartbeat();

    logger.info('Service registered:', {
      id: instance.id,
      name: instance.name,
      version: instance.version,
    });

    return instance;
  }

  async deregisterService(instanceId: string): Promise<void> {
    await this.redisClient.del(`${this.keyPrefix}${instanceId}`);

    if (this.localInstance?.id === instanceId) {
      this.stopHeartbeat();
      this.localInstance = undefined;
    }

    logger.info('Service deregistered:', { instanceId });
  }

  async getService(instanceId: string): Promise<ServiceInstance | null> {
    const data = await this.redisClient.get(`${this.keyPrefix}${instanceId}`);
    return data ? JSON.parse(data) : null;
  }

  async findServices(query: ServiceQuery = {}): Promise<ServiceInstance[]> {
    const keys = await this.redisClient.keys(`${this.keyPrefix}*`);
    const instances: ServiceInstance[] = [];

    for (const key of keys) {
      const data = await this.redisClient.get(key);
      if (data) {
        const instance = JSON.parse(data) as ServiceInstance;
        if (this.matchesQuery(instance, query)) {
          instances.push(instance);
        }
      }
    }

    return instances;
  }

  async updateServiceStatus(instanceId: string, status: ServiceInstance['status']): Promise<void> {
    const instance = await this.getService(instanceId);
    if (instance) {
      instance.status = status;
      await this.redisClient.setex(
        `${this.keyPrefix}${instanceId}`,
        this.ttl,
        JSON.stringify(instance),
      );
    }
  }

  async updateServiceMetadata(
    instanceId: string,
    metadata: Partial<ServiceInstance['metadata']>,
  ): Promise<void> {
    const instance = await this.getService(instanceId);
    if (instance) {
      instance.metadata = {
        ...instance.metadata,
        ...metadata,
      };
      await this.redisClient.setex(
        `${this.keyPrefix}${instanceId}`,
        this.ttl,
        JSON.stringify(instance),
      );
    }
  }

  private startHeartbeat(): void {
    if (this.localInstance) {
      this.heartbeatTimer = setInterval(async () => {
        try {
          if (this.localInstance) {
            this.localInstance.metadata.lastHeartbeat = new Date().toISOString();
            await this.redisClient.setex(
              `${this.keyPrefix}${this.localInstance.id}`,
              this.ttl,
              JSON.stringify(this.localInstance),
            );

            await this.redisClient.publish('service:heartbeat', JSON.stringify(this.localInstance));
          }
        } catch (error) {
          logger.error('Error sending heartbeat:', error);
        }
      }, this.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private async updateInstanceHeartbeat(instanceId: string): Promise<void> {
    const instance = await this.getService(instanceId);
    if (instance) {
      instance.metadata.lastHeartbeat = new Date().toISOString();
      await this.redisClient.setex(
        `${this.keyPrefix}${instanceId}`,
        this.ttl,
        JSON.stringify(instance),
      );
    }
  }

  private matchesQuery(instance: ServiceInstance, query: ServiceQuery): boolean {
    return (
      (!query.name || instance.name === query.name) &&
      (!query.version || instance.version === query.version) &&
      (!query.status || instance.status === query.status)
    );
  }
}

export const serviceRegistry = ServiceRegistry.getInstance();
