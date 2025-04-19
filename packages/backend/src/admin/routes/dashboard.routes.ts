import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';

const router = Router();

/**
 * @route   GET /admin/dashboard
 * @desc    Admin dashboard
 * @access  Private (Admin)
 */
router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    layout: 'layouts/main',
    activeLink: 'dashboard'
  });
});

/**
 * @route   GET /admin/dashboard/activity-log
 * @desc    Activity log
 * @access  Private (Admin)
 */
router.get('/activity-log', dashboardController.activityLog);

/**
 * @route   GET /admin/dashboard/statistics
 * @desc    System statistics
 * @access  Private (Admin)
 */
router.get('/statistics', dashboardController.statistics);

export const dashboardRoutes = router;
export default router;