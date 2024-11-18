import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { createLogger } from './utils/logger.js';

const logger = createLogger('socket');

export function initializeSocketServer(server: Server): SocketServer {
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    logger.info('Client connected', { id: socket.id });

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { id: socket.id });
    });

    // Handle agent events
    socket.on('agent:status', data => {
      logger.info('Agent status update', { id: socket.id, data });
      io.emit('agent:status:update', data);
    });

    // Handle project events
    socket.on('project:update', data => {
      logger.info('Project update', { id: socket.id, data });
      io.emit('project:updated', data);
    });

    // Handle task events
    socket.on('task:update', data => {
      logger.info('Task update', { id: socket.id, data });
      io.emit('task:updated', data);
    });
  });

  return io;
}
