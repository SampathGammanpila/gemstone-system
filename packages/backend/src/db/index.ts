import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import knex from 'knex';

// Import models
import { initUserModel } from './models/user.model';
import { initRoleModel, initUserRolesModel } from './models/role.model';
import { initPermissionModel, initRolePermissionsModel } from './models/permission.model';
import { initVerificationModel, associateVerificationModel } from './models/verification.model';
import { initGemstoneModel } from './models/gemstone.model'; 
import { initJewelryModel, initJewelryGemstonesModel } from './models/jewelry.model';

// Load environment variables
dotenv.config();

// Create Sequelize instance
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'gemstone_system',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
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
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'gemstone_system',
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