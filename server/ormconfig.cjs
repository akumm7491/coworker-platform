const { DataSource } = require('typeorm');
require('dotenv').config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5433/coworker',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/models/**/*.js'],
  migrations: ['src/migrations/**/*.js'],
  subscribers: ['src/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'src/models',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers'
  }
});

module.exports = dataSource;
