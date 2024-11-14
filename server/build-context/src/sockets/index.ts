import { Server, Socket } from 'socket.io';
import { WebSocketEvents } from '../../../shared/types';

export const setupWebSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Handle agent events
    socket.on('agent:status', (data) => {
      // Update agent status and broadcast to all clients
      io.emit('agents:update', data);
    });

    // Handle project events
    socket.on('project:update', (data) => {
      // Update project and broadcast to all clients
      io.emit('projects:update', data);
    });

    // Handle task events
    socket.on('task:update', (data) => {
      // Update task and broadcast to all clients
      io.emit('tasks:update', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};
