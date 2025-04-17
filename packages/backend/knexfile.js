// Knex configuration file
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/gemstone_dev',
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
    pool: {
      min: 2,
      max: 10,
    },
    acquireConnectionTimeout: 10000,
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/gemstone_test',
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
    pool: {
      min: 2,
      max: 20,
    },
    acquireConnectionTimeout: 60000,
    ssl: { rejectUnauthorized: false },
  },
};