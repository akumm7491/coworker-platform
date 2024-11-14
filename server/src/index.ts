import { config } from './config/env';
import { app, httpServer } from './app';

const PORT = config.port;

httpServer.listen(PORT, () => {
  console.log(`
🚀 Server is running!
🔉 Listening on port ${PORT}
📱 Connect to WebSocket at ws://localhost:${PORT}/api/ws
🌍 REST API available at http://localhost:${PORT}/api
  `);
});
