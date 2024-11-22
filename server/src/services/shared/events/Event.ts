export interface Event<T = unknown> {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  payload: T;
  metadata?: Record<string, unknown>;
  version?: string;
  correlationId?: string;
  causationId?: string;
}
