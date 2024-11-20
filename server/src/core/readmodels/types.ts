import { Event } from '../events/types.js';

export interface ReadModel {
  id: string;
  version: number;
  lastProcessedPosition?: number;
}

export interface ReadModelRepository<T extends ReadModel> {
  save(model: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  delete(id: string): Promise<void>;
}

export interface EventProcessor {
  processEvent(event: Event): Promise<void>;
  getLastProcessedPosition(): Promise<number>;
  setLastProcessedPosition(position: number): Promise<void>;
}

export interface ReadModelProjection<T extends ReadModel> {
  apply(event: Event, model: T): Promise<T>;
  createInitialState(): T;
}
