import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { setAgents } from '@/store/slices/agentsSlice';
import { setProjects } from '@/store/slices/projectsSlice';
import { Agent } from '@/types/agent';
import { Project } from '@/types/project';

class WebSocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io('/api/ws');

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('agents:update', (agents: Agent[]) => {
      store.dispatch(setAgents(agents));
    });

    this.socket.on('projects:update', (projects: Project[]) => {
      store.dispatch(setProjects(projects));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit<T>(event: string, data: T) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const wsService = new WebSocketService();
