import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/environment';
import { errorHandler } from './api/middlewares/error.middleware';
import { apiRoutes } from './api/routes';
import { adminRoutes } from './admin/routes';
import { initializeDatabase } from './db';
import { logger } from './utils/logger';

export const createServer = async (): Promise<Application> => {
  const app: Application = express();

  // Initialize database connection
  try {
    await initializeDatabase();
  } catch (err) {
    logger.error('Failed to initialize database connection', err);
    process.exit(1);
  }

  // Basic middleware setup
  app.use(helmet()); // Security headers
  app.use(compression()); // Compress responses
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev', {
    stream: {
      write: (message: string) => logger.http(message.trim())
    }
  })); // HTTP request logging
  
  // CORS configuration
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Parse request body
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  
  // Static files
  app.use(express.static(path.join(__dirname, '../public')));
  
  // API routes
  app.use('/api', apiRoutes);
  
  // Admin panel routes
  app.use('/admin', adminRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv
    });
  });
  
  // Error handling middleware (should be last)
  app.use(errorHandler);
  
  return app;
};