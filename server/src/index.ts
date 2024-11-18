import 'reflect-metadata';
import { createServer } from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('server');
const server = createServer(app);

server.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

export default server;
