// src/admin/routes/system.routes.ts
import { Router } from 'express';

const router = Router();

// GET /admin/system
router.get('/', (req, res) => {
  res.render('system/index', {
    title: 'System Management',
    layout: 'layouts/main',
    activeLink: 'system'
  });
});

// GET /admin/system/settings
router.get('/settings', (req, res) => {
  res.render('system/settings', {
    title: 'System Settings',
    layout: 'layouts/main',
    activeLink: 'system'
  });
});

// GET /admin/system/audit-log
router.get('/audit-log', (req, res) => {
  res.render('system/audit-log', {
    title: 'Audit Log',
    layout: 'layouts/main',
    activeLink: 'system'
  });
});

// GET /admin/system/backup
router.get('/backup', (req, res) => {
  res.render('system/backup', {
    title: 'Database Backup',
    layout: 'layouts/main',
    activeLink: 'system'
  });
});

export const systemManagementRoutes = router;
export default router;