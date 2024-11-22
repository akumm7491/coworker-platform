import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';

export const setupWebSockets = (io: Server, redis: Redis) => {
  // Handle new WebSocket connections
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    // Join a collaboration session
    socket.on('join:session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      console.log(`Client ${socket.id} joined session ${sessionId}`);
    });

    // Leave a collaboration session
    socket.on('leave:session', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
      console.log(`Client ${socket.id} left session ${sessionId}`);
    });

    // Handle real-time updates
    socket.on('update', async (data: { sessionId: string; update: any }) => {
      const { sessionId, update } = data;
      // Store update in Redis for persistence
      await redis.rpush(`updates:${sessionId}`, JSON.stringify(update));
      // Broadcast update to all clients in the session
      io.to(`session:${sessionId}`).emit('update', update);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Subscribe to Redis events
  const subscriber = redis.duplicate();
  subscriber.subscribe('session:created', 'session:ended');

  subscriber.on('message', (channel: string, message: string) => {
    switch (channel) {
      case 'session:created':
        io.emit('session:created', JSON.parse(message));
        break;
      case 'session:ended':
        io.emit('session:ended', message);
        break;
    }
  });
};
