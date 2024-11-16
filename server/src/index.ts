import { config } from './config/env.js';
import { app, httpServer } from './app.js';

const PORT = config.port;

// Start server (only in non-test environment)
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`
🚀 Server is running!
🔉 Listening on port ${PORT}
📱 Connect to WebSocket at ws://localhost:${PORT}/api/ws
🌍 REST API available at http://localhost:${PORT}/api
    `);
  });
}
