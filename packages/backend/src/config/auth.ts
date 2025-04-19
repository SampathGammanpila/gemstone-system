import { JwtConfig } from '../types/auth.types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Authentication configuration
 */
const authConfig = {
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-here',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-here',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m', // 15 minutes
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d', // 7 days
  } as JwtConfig,
  
  passwords: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    saltRounds: 10,
  },
  
  verification: {
    emailTokenExpiry: 72, // hours
    passwordResetTokenExpiry: 1, // hour
    maxVerificationAttempts: 5,
    verificationCooldown: 30, // minutes
  },
  
  security: {
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    cors: {
      allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '*').split(','),
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-Total-Count'],
      maxAge: 86400, // 24 hours in seconds
    },
    
    csrf: {
      enabled: process.env.NODE_ENV === 'production',
      cookie: {
        key: 'csrf-token',
        httpOnly: true,
        sameSite: 'strict' as const,
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  
  sessions: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-here',
    expiryInSeconds: 3600, // 1 hour
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  
  // Default roles in the system
  roles: {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    DEALER: 'dealer',
    CUTTER: 'cutter',
    APPRAISER: 'appraiser',
  },
};

export default authConfig;