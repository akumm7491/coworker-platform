import { User } from '../models/User';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      JWT_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      POSTGRES_URL: string;
      MONGODB_URL: string;
      REDIS_URL: string;
      ELASTICSEARCH_URL: string;
      KAFKA_BROKERS: string;
      CORS_ORIGINS: string;
      CLIENT_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
    }
  }

  namespace Express {
    interface Request {
      user?: User;
      startTime?: number;
      correlationId?: string;
    }
  }
}
