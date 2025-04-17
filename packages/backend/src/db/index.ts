import knex from 'knex';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

// Import Knex configuration
const knexConfig = require('../../knexfile');

// Determine which configuration to use based on the environment
const environment = config.nodeEnv;
const knexConfiguration = knexConfig[environment];

// Create database connection
export const db = knex(knexConfiguration);

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    const result = await db.raw('SELECT 1+1 AS result');
    
    if (result) {
      logger.info(`Database connection established in ${environment} environment`);
      
      // Check if migrations are needed
      const pendingMigrations = await db.migrate.list();
      if (pendingMigrations && pendingMigrations[1] && pendingMigrations[1].length > 0) {
        logger.info(`${pendingMigrations[1].length} pending migrations found`);
      }
    }
  } catch (error) {
    logger.error('Error connecting to database:', error);
    throw new Error('Database connection failed');
  }
};

// Clean up database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Export transaction helper function
export const transaction = async <T>(callback: (trx: knex.Transaction) => Promise<T>): Promise<T> => {
  return db.transaction(callback);
};