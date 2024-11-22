export interface DatabaseConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
  ssl?: boolean;
  synchronize?: boolean;
  logging?: boolean;
}

export interface ConnectionOptions {
  name?: string;
  config: DatabaseConfig;
  entities: unknown[];
  migrations?: string[];
  subscribers?: string[];
}

export interface QueryResult<T> {
  rows: T[];
  count: number;
}

export interface DatabaseManager {
  executeQuery: <T>(query: string, parameters?: unknown[]) => Promise<T>;
  beginTransaction: () => Promise<void>;
  commitTransaction: () => Promise<void>;
  rollbackTransaction: () => Promise<void>;
}

export interface QueryRunner {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  query: <T>(query: string, parameters?: unknown[]) => Promise<T>;
}
