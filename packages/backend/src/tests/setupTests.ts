// Setup for Jest tests

import dotenv from 'dotenv';
import { db } from '../db';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global setup before all tests
beforeAll(async () => {
  // Ensure database connection
  try {
    await db.raw('SELECT 1+1 AS result');
    console.log('Database connection established for tests');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw new Error('Database connection failed');
  }
});

// Global teardown after all tests
afterAll(async () => {
  // Close database connection
  await db.destroy();
  console.log('Database connection closed after tests');
});

// Reset database state before each test
beforeEach(async () => {
  // You might want to truncate certain tables or run specific migrations
  // await db.raw('TRUNCATE TABLE users CASCADE');
});

// Global mocks
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  stream: {
    write: jest.fn(),
  },
}));