import { Request, Response } from 'express';
import userService from '../../services/user.service';
import gemstoneService from '../../services/gemstone.service';
import roughStoneService from '../../services/rough-stone.service';
import jewelryService from '../../services/jewelry.service';
import marketplaceService from '../../services/marketplace.service';
import professionalService from '../../services/professional.service';

export class DashboardController {
  /**
   * Show admin dashboard
   */
  async index(req: Request, res: Response): Promise<void> {
    try {
      // Get statistics
      const [
        totalUsers,
        totalGemstones,
        totalRoughStones,
        totalJewelry,
        totalPendingVerifications,
        totalOrders,
        recentUserStats,
        popularItemsStats,
      ] = await Promise.all([
        userService.getTotalUsersCount(),
        gemstoneService.getTotalCount(),
        roughStoneService.getTotalCount(),
        jewelryService.getTotalCount(),
        professionalService.getPendingVerificationsCount(),
        marketplaceService.getTotalOrdersCount(),
        userService.getRecentUserStats(7), // Last 7 days
        marketplaceService.getPopularItemsStats(5), // Top 5
      ]);
      
      // Render dashboard
      res.render('dashboard/index', {
        title: 'Admin Dashboard',
        totalUsers,
        totalGemstones,
        totalRoughStones,
        totalJewelry,
        totalPendingVerifications,
        totalOrders,
        recentUserStats,
        popularItemsStats,
        error: req.flash('error'),
        success: req.flash('success'),
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'An error occurred while loading the dashboard',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }
  
  /**
   * Show activity log
   */
  async activityLog(req: Request, res: Response): Promise<void> {
    try {
      // Get pagination parameters
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      
      // Get activity log
      const adminService = (await import('../../services/admin.service')).default;
      const { logs, total } = await adminService.getActivityLog(page, limit);
      
      // Render activity log
      res.render('dashboard/activity-log', {
        title: 'Activity Log',
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        error: req.flash('error'),
        success: req.flash('success'),
      });
    } catch (error) {
      console.error('Activity log error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'An error occurred while loading the activity log',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }
  
  /**
   * Show system statistics
   */
  async statistics(req: Request, res: Response): Promise<void> {
    try {
      // Get time range from query parameters
      const range = req.query.range as string || '30d'; // Default: 30 days
      
      // Get system statistics
      const adminService = (await import('../../services/admin.service')).default;
      const statistics = await adminService.getSystemStatistics(range);
      
      // Render statistics
      res.render('dashboard/statistics', {
        title: 'System Statistics',
        statistics,
        selectedRange: range,
        error: req.flash('error'),
        success: req.flash('success'),
      });
    } catch (error) {
      console.error('Statistics error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'An error occurred while loading the statistics',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }
}

export default new DashboardController();