export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'agent_service_db',
  },
  agent: {
    maxConcurrentTasks: process.env.MAX_CONCURRENT_TASKS
      ? parseInt(process.env.MAX_CONCURRENT_TASKS, 10)
      : 5,
    learningRate: process.env.LEARNING_RATE ? parseFloat(process.env.LEARNING_RATE) : 0.01,
    consensusThreshold: process.env.CONSENSUS_THRESHOLD
      ? parseFloat(process.env.CONSENSUS_THRESHOLD)
      : 0.75,
  },
});
