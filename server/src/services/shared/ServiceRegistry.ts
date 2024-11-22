import { Container } from 'typedi';
import logger from '../../utils/logger.js';

type Constructor<T> = new (...args: unknown[]) => T;
type ServiceMap = Map<string, unknown>;

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: ServiceMap = new Map();
  private logger = logger;

  private constructor() {
    // Private constructor to enforce singleton
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  register<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      this.logger.warn(`Service ${name} is being overwritten`);
    }
    this.services.set(name, service);
    Container.set(name, service);
    this.logger.info(`Service ${name} registered successfully`);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in registry`);
    }
    return service as T;
  }

  remove(name: string): void {
    if (this.services.has(name)) {
      this.services.delete(name);
      Container.remove(name);
      this.logger.info(`Service ${name} removed from registry`);
    }
  }

  clear(): void {
    this.services.clear();
    Container.reset();
    this.logger.info('Service registry cleared');
  }

  listServices(): string[] {
    return Array.from(this.services.keys());
  }

  hasService(name: string): boolean {
    return this.services.has(name);
  }

  getServiceInstance<T>(ServiceClass: Constructor<T>): T {
    const serviceName = ServiceClass.name;

    if (!this.hasService(serviceName)) {
      const instance = Container.get(ServiceClass);
      this.register(serviceName, instance);
    }

    return this.get<T>(serviceName);
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Helper decorators
export function Service(): ClassDecorator {
  return function <T extends Constructor<unknown>>(target: T): T | void {
    Container.set(target.name, new target());
  };
}

export function Inject(serviceName: string): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    Object.defineProperty(target, propertyKey, {
      get: () => serviceRegistry.get(serviceName),
      enumerable: true,
      configurable: true,
    });
  };
}
