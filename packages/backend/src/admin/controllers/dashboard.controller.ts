import { Request, Response } from 'express';
import { db } from '../../db';
import { logger } from '../../utils/logger';

// Define interfaces for better type checking
interface TableChecks {
  users: boolean;
  gemstones: boolean;
  rough_stones: boolean;
  jewelry: boolean;
  professionals: boolean;
  marketplace_orders: boolean;
}

interface RecentUserStats {
  newUsers: number;
  activeUsers: number;
  period: number;
}

interface PopularItem {
  id: string;
  title: string;
  price: number;
  item_type: string;
  view_count: number;
  order_count: number;
}

interface StatItem {
  date: string;
  count: number;
  revenue?: number;
}

export class DashboardController {
  /**
   * Check if required tables exist in the database
   * @private
   */
  private async checkRequiredTables(): Promise<TableChecks> {
    try {
      const tableChecks = {
        users: await db.schema.hasTable('users'),
        gemstones: await db.schema.hasTable('gemstones'),
        rough_stones: await db.schema.hasTable('rough_stones'),
        jewelry: await db.schema.hasTable('jewelry'),
        professionals: await db.schema.hasTable('professionals'),
        marketplace_orders: await db.schema.hasTable('marketplace_orders')
      };
      
      return tableChecks;
    } catch (error) {
      logger.error('Error checking database tables:', error);
      // Return default values in case of error
      return {
        users: true,
        gemstones: false,
        rough_stones: false,
        jewelry: false,
        professionals: false,
        marketplace_orders: false
      };
    }
  }

  /**
   * Check if a column exists in a table
   * @private
   */
  private async columnExists(table: string, column: string): Promise<boolean> {
    try {
      // Check if the table exists first
      const tableExists = await db.schema.hasTable(table);
      if (!tableExists) return false;
      
      // Check if the column exists
      const columnInfo = await db(table).columnInfo();
      return columnInfo.hasOwnProperty(column);
    } catch (error) {
      logger.error(`Error checking if column ${column} exists in table ${table}:`, error);
      return false;
    }
  }

  /**
   * Show admin dashboard
   */
  async index(req: Request, res: Response): Promise<void> {
    try {
      // Check if required tables exist
      const tableExists = await this.checkRequiredTables();
      
      // Get counts from tables that exist
      const [
        totalUsers,
        totalGemstones,
        totalRoughStones,
        totalJewelry,
        totalPendingVerifications,
        totalOrders
      ] = await Promise.all([
        // Get user count
        tableExists.users 
          ? db('users').count('id as count').first().then(result => Number(result?.count || 0)) 
          : Promise.resolve(0),
        // Get gemstone count
        tableExists.gemstones 
          ? db('gemstones').count('id as count').first().then(result => Number(result?.count || 0)) 
          : Promise.resolve(0),
        // Get rough stone count
        tableExists.rough_stones 
          ? db('rough_stones').count('id as count').first().then(result => Number(result?.count || 0)) 
          : Promise.resolve(0),
        // Get jewelry count
        tableExists.jewelry 
          ? db('jewelry').count('id as count').first().then(result => Number(result?.count || 0)) 
          : Promise.resolve(0),
        // Get pending verification count
        tableExists.professionals 
          ? db('professionals').where('verification_status', 'pending').count('id as count').first().then(result => Number(result?.count || 0)) 
          : Promise.resolve(0),
        // Get order count
        tableExists.marketplace_orders 
          ? db('marketplace_orders').count('id as count').first().then(result => Number(result?.count || 0)) 
          : Promise.resolve(0)
      ]);
      
      // Get recent user stats (last 7 days)
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - 7);
      
      // Check if last_login_at column exists
      const hasLastLoginColumn = await this.columnExists('users', 'last_login_at');
      
      let recentUserStats: RecentUserStats = { newUsers: 0, activeUsers: 0, period: 7 };
      
      if (tableExists.users) {
        // Get new users count
        const newUsersCount = await db('users')
          .where('created_at', '>=', daysAgo)
          .count('id as count')
          .first()
          .then(result => Number(result?.count || 0));
          
        // Get active users count (only if last_login_at column exists)
        const activeUsersCount = hasLastLoginColumn
          ? await db('users')
              .where('last_login_at', '>=', daysAgo)
              .count('id as count')
              .first()
              .then(result => Number(result?.count || 0))
          : 0;
          
        recentUserStats = {
          newUsers: newUsersCount,
          activeUsers: activeUsersCount,
          period: 7
        };
      }
      
      // Get popular items stats (dummy data for now)
      const popularItemsStats: PopularItem[] = [
        {
          id: '1',
          title: 'Blue Sapphire',
          price: 1299.99,
          item_type: 'gemstone',
          view_count: 152,
          order_count: 12
        },
        {
          id: '2',
          title: 'Ruby Ring',
          price: 2499.99,
          item_type: 'jewelry',
          view_count: 134,
          order_count: 8
        }
      ];
      
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
        error: req.flash ? req.flash('error') : null,
        success: req.flash ? req.flash('success') : null,
      });
    } catch (error) {
      logger.error('Dashboard error:', error);
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
      
      // Check if audit_logs table exists
      const hasAuditTable = await db.schema.hasTable('audit_logs');
      
      // Check if necessary columns exist
      const hasTimestampColumn = hasAuditTable ? 
        await this.columnExists('audit_logs', 'timestamp') : false;
      
      // Get activity log
      let logs: any[] = [];
      let total = 0;
      
      if (hasAuditTable) {
        const offset = (page - 1) * limit;
        
        // Use the appropriate column for ordering
        const orderByColumn = hasTimestampColumn ? 'timestamp' : 'created_at';
        
        logs = await db('audit_logs')
          .leftJoin('users', 'audit_logs.user_id', 'users.id')
          .select(
            'audit_logs.*',
            db.raw(`CONCAT(COALESCE(users.first_name, ''), ' ', COALESCE(users.last_name, '')) as user_name`),
            'users.email'
          )
          .orderBy(`audit_logs.${orderByColumn}`, 'desc')
          .limit(limit)
          .offset(offset);
        
        const countResult = await db('audit_logs').count('id as count').first();
        total = Number(countResult?.count || 0);
      }
      
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
        error: req.flash ? req.flash('error') : null,
        success: req.flash ? req.flash('success') : null,
      });
    } catch (error) {
      logger.error('Activity log error:', error);
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
      
      // Parse range and create date range
      const endDate = new Date();
      let startDate = new Date();
      let groupByFormat = 'YYYY-MM-DD'; // Default daily grouping
      
      switch (range) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          groupByFormat = 'YYYY-MM-DD'; // Weekly might be better for 90 days
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          groupByFormat = 'YYYY-MM'; // Monthly grouping for year view
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Check for required tables
      const tableExists = await this.checkRequiredTables();
      
      // Get user stats (safely)
      let userStats: any[] = [];
      let gemstoneStats: any[] = [];
      let orderStats: any[] = [];
      
      // Check if required columns exist
      const hasCreatedAtColumn = tableExists.users ? 
        await this.columnExists('users', 'created_at') : false;
        
      if (tableExists.users && hasCreatedAtColumn) {
        try {
          userStats = await db('users')
            .whereBetween('created_at', [startDate, endDate])
            .select(db.raw(`to_char(created_at, '${groupByFormat}') as date`))
            .count('id as count')
            .groupBy('date')
            .orderBy('date');
        } catch (error) {
          logger.error('Error fetching user stats:', error);
          userStats = [];
        }
      }
      
      // Get gemstone stats (safely)
      if (tableExists.gemstones && await this.columnExists('gemstones', 'created_at')) {
        try {
          gemstoneStats = await db('gemstones')
            .whereBetween('created_at', [startDate, endDate])
            .select(db.raw(`to_char(created_at, '${groupByFormat}') as date`))
            .count('id as count')
            .groupBy('date')
            .orderBy('date');
        } catch (error) {
          logger.error('Error fetching gemstone stats:', error);
          gemstoneStats = [];
        }
      }
      
      // Get order stats with revenue (safely)
      if (tableExists.marketplace_orders && 
          await this.columnExists('marketplace_orders', 'created_at') &&
          await this.columnExists('marketplace_orders', 'total_amount')) {
        try {
          orderStats = await db('marketplace_orders')
            .whereBetween('created_at', [startDate, endDate])
            .select(db.raw(`to_char(created_at, '${groupByFormat}') as date`))
            .count('id as count')
            .sum('total_amount as revenue')
            .groupBy('date')
            .orderBy('date');
        } catch (error) {
          logger.error('Error fetching order stats:', error);
          orderStats = [];
        }
      }
      
      // Convert counts to numbers
      const formattedUserStats: StatItem[] = userStats.map(stat => ({
        date: stat.date,
        count: Number(stat.count || 0)
      }));
      
      const formattedGemstoneStats: StatItem[] = gemstoneStats.map(stat => ({
        date: stat.date,
        count: Number(stat.count || 0)
      }));
      
      const formattedOrderStats: StatItem[] = orderStats.map(stat => ({
        date: stat.date,
        count: Number(stat.count || 0),
        revenue: Number(stat.revenue || 0)
      }));
      
      // Get total counts safely
      let userTotal = 0;
      let gemstoneTotal = 0;
      let orderTotal = 0;
      
      if (tableExists.users) {
        try {
          const result = await db('users').count('id as count').first();
          userTotal = Number(result?.count || 0);
        } catch (error) {
          logger.error('Error fetching user total:', error);
        }
      }
      
      if (tableExists.gemstones) {
        try {
          const result = await db('gemstones').count('id as count').first();
          gemstoneTotal = Number(result?.count || 0);
        } catch (error) {
          logger.error('Error fetching gemstone total:', error);
        }
      }
      
      if (tableExists.marketplace_orders) {
        try {
          const result = await db('marketplace_orders').count('id as count').first();
          orderTotal = Number(result?.count || 0);
        } catch (error) {
          logger.error('Error fetching order total:', error);
        }
      }
      
      // Compile statistics
      const statistics = {
        users: {
          total: userTotal,
          stats: formattedUserStats
        },
        gemstones: {
          total: gemstoneTotal,
          stats: formattedGemstoneStats
        },
        orders: {
          total: orderTotal,
          stats: formattedOrderStats
        },
        range
      };
      
      // Render statistics
      res.render('dashboard/statistics', {
        title: 'System Statistics',
        statistics,
        selectedRange: range,
        error: req.flash ? req.flash('error') : null,
        success: req.flash ? req.flash('success') : null,
      });
    } catch (error) {
      logger.error('Statistics error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'An error occurred while loading the statistics',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }
}

export default new DashboardController();