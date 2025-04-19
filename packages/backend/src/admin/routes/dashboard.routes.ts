import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';

const router = Router();

/**
 * @route   GET /admin/dashboard
 * @desc    Admin dashboard
 * @access  Private (Admin)
 */
router.get('/', (req, res, next) => {
  dashboardController.index(req, res).catch(next);
});

/**
 * @route   GET /admin/dashboard/activity-log
 * @desc    Activity log
 * @access  Private (Admin)
 */
router.get('/activity-log', (req, res, next) => {
  dashboardController.activityLog(req, res).catch(next);
});

/**
 * @route   GET /admin/dashboard/statistics
 * @desc    System statistics
 * @access  Private (Admin)
 */
router.get('/statistics', (req, res, next) => {
  dashboardController.statistics(req, res).catch(next);
});

export const dashboardRoutes = router;
export default router;