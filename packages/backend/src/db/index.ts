// src/db/index.ts
import { Sequelize } from 'sequelize';
import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

// Import models
import { initUserModel } from './models/user.model';
import { initRoleModel, initUserRolesModel } from './models/role.model';
import { initPermissionModel, initRolePermissionsModel } from './models/permission.model';
import { initVerificationModel, associateVerificationModel } from './models/verification.model';
import { initGemstoneModel } from './models/gemstone.model'; 
import { initJewelryModel, initJewelryGemstonesModel } from './models/jewelry.model';

// Get database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'gemstone_dev',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'vikum5723',
};

console.log('Database Config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  // Don't log password for security reasons
  password: dbConfig.password ? '********' : 'not set'
});

// Create Sequelize instance
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Create Knex instance
export const db = knex({
  client: 'pg',
  connection: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
  },
  pool: {
    min: 0,
    max: 7,
  },
});

// Initialize models
const User = initUserModel(sequelize);
const Role = initRoleModel(sequelize);
const Permission = initPermissionModel(sequelize);
const Verification = initVerificationModel(sequelize);
const Gemstone = initGemstoneModel(sequelize);
const Jewelry = initJewelryModel(sequelize);

// Setup associations
initUserRolesModel(sequelize, User, Role);
initRolePermissionsModel(sequelize, Role, Permission);
associateVerificationModel(User, Verification);
initJewelryGemstonesModel(sequelize, Jewelry, Gemstone);

// Export models
export const models = {
  User,
  Role,
  Permission,
  Verification,
  Gemstone,
  Jewelry
};

// Database synchronization function
export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};