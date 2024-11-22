import { config } from './env.js';
import logger from '../utils/logger.js';
import { AgentSystem, AgentSystemConfig } from '../core/agent/AgentSystem.js';

export const agentSystemConfig: AgentSystemConfig = {
  pool: {
    host: config.postgres.host,
    port: config.postgres.port,
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
  },
  logger,
  maxConcurrentAgents: Number(process.env.AGENT_MAX_CONCURRENT_TASKS) || 5,
  healthCheckInterval: 30000, // 30 seconds
};

let agentSystem: AgentSystem | null = null;

export async function initializeAgentSystem(): Promise<AgentSystem> {
  if (!agentSystem) {
    agentSystem = new AgentSystem(agentSystemConfig);
    await agentSystem.initialize();
    logger.info('Agent system initialized successfully');
  }
  return agentSystem;
}

export async function shutdownAgentSystem(): Promise<void> {
  if (agentSystem) {
    await agentSystem.shutdown();
    agentSystem = null;
    logger.info('Agent system shut down successfully');
  }
}
