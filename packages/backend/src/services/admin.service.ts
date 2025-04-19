import { sequelize } from '../db';
import { User } from '../db/models/user.model';
import { Role } from '../db/models/role.model';
import { UserRole } from '../types/user.types';
import { hashPassword } from '../utils/encryption';

interface AdminUser {
  id: string; // Changed from number to string
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminService {
  /**
   * Find admin user by email
   */
  async findAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: Role,
            where: { name: UserRole.ADMIN },
            required: true,
          },
        ],
      });
      
      if (!user) return null;
      
      return {
        id: user.id.toString(), // Convert to string
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        mfaEnabled: !!user.get('mfaEnabled'),
        mfaSecret: user.get('mfaSecret') as string | undefined,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
      const user = await User.findOne({
        where: { id },
        include: [
          {
            model: Role,
            where: { name: UserRole.ADMIN },
            required: true,
          },
        ],
      });
      
      if (!user) return null;
      
      return {
        id: user.id.toString(), // Convert to string
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        mfaEnabled: !!user.get('mfaEnabled'),
        mfaSecret: user.get('mfaSecret') as string | undefined,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
      const [updated] = await User.update(
        { lastLoginAt: new Date() },
        { where: { id } }
      );
      
      return updated > 0;
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
      const [updated] = await User.update(
        { password: hashedPassword },
        { where: { id } }
      );
      
      return updated > 0;
    } catch (error) {
      console.error('Error updating admin password:', error);
      throw error;
    }
  }
  
  /**
   * Enable MFA for admin
   */
  async enableMfa(id: string, secret: string): Promise<boolean> {
    try {
      const [updated] = await User.update(
        {
          mfaEnabled: true,
          mfaSecret: secret,
        },
        { where: { id } }
      );
      
      return updated > 0;
    } catch (error) {
      console.error('Error enabling MFA for admin:', error);
      throw error;
    }
  }
  
  /**
   * Disable MFA for admin
   */
  async disableMfa(id: string): Promise<boolean> {
    try {
      const [updated] = await User.update(
        {
          mfaEnabled: false,
          mfaSecret: null,
        },
        { where: { id } }
      );
      
      return updated > 0;
    } catch (error) {
      console.error('Error disabling MFA for admin:', error);
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
    const transaction = await sequelize.transaction();
    
    try {
      // Create user
      const hashedPassword = await hashPassword(adminData.password);
      
      const user = await User.create(
        {
          email: adminData.email,
          password: hashedPassword,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          isEmailVerified: true,
          status: 'active',
        },
        { transaction }
      );
      
      // Find admin role
      const adminRole = await Role.findOne({
        where: { name: UserRole.ADMIN },
        transaction,
      });
      
      if (!adminRole) {
        throw new Error('Admin role not found');
      }
      
      // Assign admin role
      // @ts-ignore - TypeScript doesn't recognize the association methods
      await user.addRole(adminRole, { transaction });
      
      await transaction.commit();
      
      return this.findAdminById(user.id.toString()); // Convert to string
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating admin:', error);
      throw error;
    }
  }
  
  /**
   * Get activity log
   */
  async getActivityLog(page: number = 1, limit: number = 20): Promise<{ logs: any[]; total: number }> {
    try {
      // Import audit model only when needed
      const { default: Audit } = await import('../db/models/audit.model');
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Audit.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'firstName', 'lastName'],
          },
        ],
      });
      
      return {
        logs: rows,
        total: count,
      };
    } catch (error) {
      console.error('Error getting activity log:', error);
      throw error;
    }
  }
  
  /**
   * Get system statistics
   */
  async getSystemStatistics(range: string = '30d'): Promise<any> {
    try {
      // Parse range to SQL interval
      let interval: string;
      
      switch (range) {
        case '7d':
          interval = '7 day';
          break;
        case '30d':
          interval = '30 day';
          break;
        case '90d':
          interval = '90 day';
          break;
        case '1y':
          interval = '1 year';
          break;
        default:
          interval = '30 day';
      }
      
      // Get user registration statistics
      const userStats = await sequelize.query(`
        SELECT 
          DATE(date_trunc('day', "createdAt")) as date,
          COUNT(*) as count
        FROM users
        WHERE "createdAt" >= NOW() - INTERVAL '${interval}'
        GROUP BY date
        ORDER BY date
      `, { type: sequelize.QueryTypes.SELECT });
      
      // Get gemstone registration statistics
      const gemstoneStats = await sequelize.query(`
        SELECT 
          DATE(date_trunc('day', "createdAt")) as date,
          COUNT(*) as count
        FROM gemstones
        WHERE "createdAt" >= NOW() - INTERVAL '${interval}'
        GROUP BY date
        ORDER BY date
      `, { type: sequelize.QueryTypes.SELECT });
      
      // Get order statistics
      const orderStats = await sequelize.query(`
        SELECT 
          DATE(date_trunc('day', "createdAt")) as date,
          COUNT(*) as count,
          SUM("totalAmount") as revenue
        FROM orders
        WHERE "createdAt" >= NOW() - INTERVAL '${interval}'
        GROUP BY date
        ORDER BY date
      `, { type: sequelize.QueryTypes.SELECT });
      
      return {
        userStats,
        gemstoneStats,
        orderStats,
        range,
      };
    } catch (error) {
      console.error('Error getting system statistics:', error);
      throw error;
    }
  }
}

export default new AdminService();