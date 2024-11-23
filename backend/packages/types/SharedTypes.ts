// Common value objects and types used across multiple bounded contexts

export interface Metadata {
  created_at: Date;
  updated_at: Date;
  version: number;
}

export interface AuditInfo {
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ResourceMetrics {
  utilization: number;
  efficiency: number;
  quality_score: number;
  performance_index: number;
}

export interface ProgressTracker {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  progress_percentage: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ScheduleSlot {
  time_range: TimeRange;
  resource_id: string;
  resource_type: string;
  status: Status;
  priority: Priority;
}
