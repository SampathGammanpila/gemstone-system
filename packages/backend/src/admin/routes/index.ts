// src/admin/routes/index.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../api/middlewares/auth.middleware';
import { dashboardRoutes } from './dashboard.routes';
import { userManagementRoutes } from './user.routes';
import { gemstoneManagementRoutes } from './gemstone.routes';
import { roughStoneManagementRoutes } from './rough-stone.routes';
import { professionalManagementRoutes } from './professional.routes';
import { referenceDataManagementRoutes } from './reference-data.routes';
import { systemRoutes } from './system.routes';
import { logger } from '../../utils/logger';

const router = Router();

// Admin panel home/login
router.get('/', (req, res) => {
  // Render admin login page
  res.render('admin/auth/login', {
    title: 'Admin Login',
    layout: false
  });
});

// Protect all admin routes
router.use(authenticate);
router.use(authorize(['admin']));

// Log admin requests
router.use((req, res, next) => {
  logger.debug(`Admin Request: ${req.method} ${req.path} by ${req.userId}`);
  next();
});

// Mount admin routes
router.use('/dashboard', dashboardRoutes);
router.use('/users', userManagementRoutes);
router.use('/gemstones', gemstoneManagementRoutes);
router.use('/rough-stones', roughStoneManagementRoutes);
router.use('/professionals', professionalManagementRoutes);
router.use('/reference-data', referenceDataManagementRoutes);
router.use('/system', systemRoutes);

export const adminRoutes = router;