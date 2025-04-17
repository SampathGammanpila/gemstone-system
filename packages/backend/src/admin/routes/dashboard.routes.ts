// src/admin/routes/dashboard.routes.ts
import { Router } from 'express';

const router = Router();

// GET /admin/dashboard
router.get('/', (req, res) => {
  res.render('admin/dashboard/index', {
    title: 'Admin Dashboard',
    layout: 'layouts/main',
    activeLink: 'dashboard'
  });
});

export const dashboardRoutes = router;