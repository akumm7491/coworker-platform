import { ReadModel } from './types.js';

export interface AgentReadModel extends ReadModel {
  name: string;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  capabilities: string[];
  currentTasks: string[];
  lastUpdated: Date;
}

export const createInitialAgentReadModel = (id: string): AgentReadModel => ({
  id,
  version: 0,
  name: '',
  status: 'OFFLINE',
  capabilities: [],
  currentTasks: [],
  lastUpdated: new Date(),
});
