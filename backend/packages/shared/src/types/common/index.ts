export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filter?: Record<string, unknown>;
}

export type Nullable<T> = T | null;

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}
