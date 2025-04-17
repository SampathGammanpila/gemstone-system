// src/api/routes/index.ts
import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { gemstoneRoutes } from './gemstone.routes';
import { roughStoneRoutes } from './rough-stone.routes';
import { professionalRoutes } from './professional.routes';
import { marketplaceRoutes } from './marketplace.routes';
import { referenceDataRoutes } from './reference-data.routes';
import { uploadRoutes } from './upload.routes';
import { logger } from '../../utils/logger';
import { notFoundHandler } from '../middlewares/error.middleware';

const router = Router();

// Log API requests
router.use((req, res, next) => {
  logger.debug(`API Request: ${req.method} ${req.path}`);
  next();
});

// API version and health check
router.get('/', (req, res) => {
  res.json({
    name: 'Gemstone System API',
    version: '1.0.0',
    status: 'OK'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/gemstones', gemstoneRoutes);
router.use('/rough-stones', roughStoneRoutes);
router.use('/professionals', professionalRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/reference-data', referenceDataRoutes);
router.use('/upload', uploadRoutes);

// Handle 404 for API routes
router.use(notFoundHandler);

export const apiRoutes = router;