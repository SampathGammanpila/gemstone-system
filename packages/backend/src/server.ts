import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'body-parser';

import apiRoutes from './api/routes';
import adminRoutes from './admin/routes';
import { errorHandler, notFoundHandler } from './api/middlewares/error.middleware';
import config from './config/auth';

export const createServer = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.security.cors.allowedOrigins.includes('*') 
      ? '*' 
      : config.security.cors.allowedOrigins,
    methods: config.security.cors.allowedMethods,
    allowedHeaders: config.security.cors.allowedHeaders,
    exposedHeaders: config.security.cors.exposedHeaders,
    maxAge: config.security.cors.maxAge,
    credentials: true,
  }));

  // Apply rate limiting
  app.use(rateLimit({
    windowMs: config.security.rateLimiting.windowMs,
    max: config.security.rateLimiting.max,
    standardHeaders: config.security.rateLimiting.standardHeaders,
    legacyHeaders: config.security.rateLimiting.legacyHeaders,
  }));

  // Parsing middleware
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());

  // Compression and logging
  app.use(compression());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Static files
  app.use(express.static('public'));
  
  // Set view engine for admin panel
  app.set('view engine', 'ejs');
  app.set('views', './src/admin/views');

  // Routes
  app.use('/api', apiRoutes);
  app.use('/admin', adminRoutes);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};