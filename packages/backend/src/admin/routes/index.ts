import { Router } from 'express';
import { dashboardRoutes } from './dashboard.routes';
import { userManagementRoutes } from './user.routes';
import { professionalManagementRoutes } from './professional.routes';
import { gemstoneManagementRoutes } from './gemstone.routes';
import { roughStoneManagementRoutes } from './rough-stone.routes';
import { referenceDataManagementRoutes } from './reference-data.routes';
import { systemManagementRoutes } from './system.routes';
import { adminAuthRoutes } from './auth.routes';
import { authenticate } from '../middlewares/admin-auth.middleware';

// Import express-session types to augment the session
import 'express-session';

// Declare module augmentation for TypeScript to recognize adminUser in session
declare module 'express-session' {
  interface Session {
    adminUser?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    returnTo?: string;
  }
}

const router = Router();

// Admin auth routes (login, logout, etc.) - public
router.use('/auth', adminAuthRoutes);

// Protected admin routes - require admin authentication
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/users', authenticate, userManagementRoutes);
router.use('/professionals', authenticate, professionalManagementRoutes);
router.use('/gemstones', authenticate, gemstoneManagementRoutes);
router.use('/rough-stones', authenticate, roughStoneManagementRoutes);
router.use('/reference-data', authenticate, referenceDataManagementRoutes);
router.use('/system', authenticate, systemManagementRoutes);

// Admin panel home - redirects to login or dashboard
router.get('/', (req, res) => {
  if (req.session && req.session.adminUser) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/auth/login');
  }
});

export default router;