import { db } from '../db';
import { hashPassword, comparePassword } from '../utils/encryption';

// Admin user interface
interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  lastLoginAt?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
}

// Interface for statistics data
interface StatisticItem {
  date: string;
  count: number;
  revenue?: number;
}

interface SystemStatistics {
  usersCount: number;
  userStats: StatisticItem[];
  gemstoneStats: StatisticItem[];
  orderStats: StatisticItem[];
  range: string;
}

export class AdminService {
  /**
   * Find admin user by email
   */
  async findAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      // Use raw SQL with knex instead of Sequelize to avoid column name mismatches
      const results = await db.raw(`
        SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.created_at, u.updated_at, u.mfa_enabled, u.mfa_secret
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.email = ? AND r.name = 'admin'
        LIMIT 1
      `, [email]);
      
      if (!results.rows || results.rows.length === 0) {
        return null;
      }
      
      const user = results.rows[0];
      
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.first_name,
        lastName: user.last_name,
        lastLoginAt: user.last_login_at,
        mfaEnabled: user.mfa_enabled || false,
        mfaSecret: user.mfa_secret || undefined
      };
    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw error;
    }
  }
  
  /**
   * Find admin user by ID
   */
  async findAdminById(id: string): Promise<AdminUser | null> {
    try {
      // Use raw SQL with knex instead of Sequelize
      const results = await db.raw(`
        SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.created_at, u.updated_at, u.mfa_enabled, u.mfa_secret
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = ? AND r.name = 'admin'
        LIMIT 1
      `, [id]);
      
      if (!results.rows || results.rows.length === 0) {
        return null;
      }
      
      const user = results.rows[0];
      
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.first_name,
        lastName: user.last_name,
        lastLoginAt: user.last_login_at,
        mfaEnabled: user.mfa_enabled || false,
        mfaSecret: user.mfa_secret || undefined
      };
    } catch (error) {
      console.error('Error finding admin by ID:', error);
      throw error;
    }
  }
  
  /**
   * Update admin's last login time
   */
  async updateLastLogin(id: string): Promise<boolean> {
    try {
      await db('users')
        .where('id', id)
        .update({
          last_login_at: new Date(),
          updated_at: new Date()
        });
      
      return true;
    } catch (error) {
      console.error('Error updating admin last login:', error);
      throw error;
    }
  }
  
  /**
   * Update admin's password
   */
  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    try {
      await db('users')
        .where('id', id)
        .update({
          password: hashedPassword,
          updated_at: new Date()
        });
      
      return true;
    } catch (error) {
      console.error('Error updating admin password:', error);
      throw error;
    }
  }

  /**
   * Enable MFA for admin user
   */
  async enableMfa(id: string, secret: string): Promise<boolean> {
    try {
      await db('users')
        .where('id', id)
        .update({
          mfa_enabled: true,
          mfa_secret: secret,
          updated_at: new Date()
        });
      
      return true;
    } catch (error) {
      console.error('Error enabling MFA:', error);
      throw error;
    }
  }

  /**
   * Disable MFA for admin user
   */
  async disableMfa(id: string): Promise<boolean> {
    try {
      await db('users')
        .where('id', id)
        .update({
          mfa_enabled: false,
          mfa_secret: null,
          updated_at: new Date()
        });
      
      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      throw error;
    }
  }
  
  /**
   * Create a new admin user
   */
  async createAdmin(adminData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AdminUser | null> {
    const trx = await db.transaction();
    
    try {
      // Check if user already exists
      const existingUser = await trx('users')
        .where('email', adminData.email)
        .first();
      
      if (existingUser) {
        await trx.rollback();
        throw new Error('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await hashPassword(adminData.password);
      
      // Create user
      const [userId] = await trx('users')
        .insert({
          email: adminData.email,
          password: hashedPassword,
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          mfa_enabled: false,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('id');
      
      // Find or create admin role
      let roleId;
      const adminRole = await trx('roles')
        .where('name', 'admin')
        .first();
      
      if (!adminRole) {
        [roleId] = await trx('roles')
          .insert({
            name: 'admin',
            description: 'System administrator'
          })
          .returning('id');
      } else {
        roleId = adminRole.id;
      }
      
      // Assign admin role
      await trx('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId
        });
      
      await trx.commit();
      
      return this.findAdminById(userId);
    } catch (error) {
      await trx.rollback();
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  /**
   * Get activity log with pagination
   */
  async getActivityLog(page: number = 1, limit: number = 20): Promise<{ logs: any[]; total: number }> {
    try {
      // Check if the audit_logs table exists
      const hasTable = await db.schema.hasTable('audit_logs');
      
      // If the table doesn't exist, return empty results
      if (!hasTable) {
        console.log('audit_logs table does not exist');
        return { logs: [], total: 0 };
      }
      
      const offset = (page - 1) * limit;
      
      // Get logs with pagination
      const logs = await db('audit_logs')
        .leftJoin('users', 'audit_logs.user_id', 'users.id')
        .select(
          'audit_logs.*',
          'users.email',
          'users.first_name',
          'users.last_name'
        )
        .orderBy('audit_logs.created_at', 'desc')
        .limit(limit)
        .offset(offset);
      
      // Get total count
      const [result] = await db('audit_logs').count('id as count');
      const total = parseInt(result.count as string, 10) || 0;
      
      return {
        logs,
        total
      };
    } catch (error) {
      console.error('Error getting activity log:', error);
      // Return empty set instead of failing
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStatistics(range: string = '30d'): Promise<SystemStatistics> {
    try {
      // Create date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (range) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Get user statistics
      const usersCount = await db('users').count('id as count').first();
      
      // Get registration statistics grouped by day
      const userStatsRaw = await db('users')
        .whereBetween('created_at', [startDate, endDate])
        .select(db.raw('DATE(created_at) as date'))
        .count('id as count')
        .groupBy('date')
        .orderBy('date');
      
      // Map to the correct interface
      const userStats: StatisticItem[] = userStatsRaw.map(item => ({
        date: String(item.date),
        count: parseInt(item.count as string, 10) || 0
      }));
      
      // Check if gemstones table exists and get stats
      let gemstoneStats: StatisticItem[] = [];
      if (await db.schema.hasTable('gemstones')) {
        const gemstoneStatsRaw = await db('gemstones')
          .whereBetween('created_at', [startDate, endDate])
          .select(db.raw('DATE(created_at) as date'))
          .count('id as count')
          .groupBy('date')
          .orderBy('date');
          
        gemstoneStats = gemstoneStatsRaw.map(item => ({
          date: String(item.date),
          count: parseInt(item.count as string, 10) || 0
        }));
      }
      
      // Check if orders table exists and get stats
      let orderStats: StatisticItem[] = [];
      if (await db.schema.hasTable('orders')) {
        const orderStatsRaw = await db('orders')
          .whereBetween('created_at', [startDate, endDate])
          .select(db.raw('DATE(created_at) as date'))
          .count('id as count')
          .sum('total_amount as revenue')
          .groupBy('date')
          .orderBy('date');
          
        orderStats = orderStatsRaw.map(item => ({
          date: String(item.date),
          count: parseInt(item.count as string, 10) || 0,
          revenue: parseFloat(item.revenue as string) || 0
        }));
      }
      
      return {
        usersCount: parseInt(usersCount?.count as string, 10) || 0,
        userStats,
        gemstoneStats,
        orderStats,
        range,
      };
    } catch (error) {
      console.error('Error getting system statistics:', error);
      // Return basic stats instead of failing
      return {
        usersCount: 0,
        userStats: [],
        gemstoneStats: [],
        orderStats: [],
        range,
      };
    }
  }
}

export default new AdminService();