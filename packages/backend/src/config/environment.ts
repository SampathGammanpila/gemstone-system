import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the appropriate .env file
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });

// Define configuration interface
interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiry: string;
  corsOrigin: string | RegExp | (string | RegExp)[];
  uploadDir: string;
  adminEmail: string;
  logLevel: string;
  bcryptSaltRounds: number;
  cloudStorage?: {
    provider: string;
    apiKey: string;
    apiSecret: string;
    bucket: string;
  };
}

// Create and export configuration object
export const config: Config = {
  nodeEnv,
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/gemstone_dev',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  corsOrigin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : (nodeEnv === 'production' ? 'https://your-production-domain.com' : 'http://localhost:5173'),
  uploadDir: process.env.UPLOAD_DIR || './public/uploads',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  logLevel: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
};

// Add cloud storage config if provided
if (process.env.CLOUD_STORAGE_PROVIDER) {
  config.cloudStorage = {
    provider: process.env.CLOUD_STORAGE_PROVIDER,
    apiKey: process.env.CLOUD_STORAGE_API_KEY || '',
    apiSecret: process.env.CLOUD_STORAGE_API_SECRET || '',
    bucket: process.env.CLOUD_STORAGE_BUCKET || ''
  };
}

// Validate required configuration
const validateConfig = () => {
  const requiredVars = ['databaseUrl', 'jwtSecret'];
  const missingVars = requiredVars.filter(varName => !config[varName as keyof Config]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Additional validations
  if (config.nodeEnv === 'production' && config.jwtSecret === 'dev_secret_key') {
    throw new Error('Using default JWT secret in production environment');
  }
};

// Run validation
validateConfig();