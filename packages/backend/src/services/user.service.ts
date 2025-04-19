import userRepository from '../db/repositories/user.repository';
import roleRepository from '../db/repositories/role.repository';
import { sequelize } from '../db';
import { QueryTypes } from 'sequelize';
import { UserProfileUpdateRequest, UserStatus, UserWithRoles, UserPublicProfile } from '../types/user.types';
import { PermissionCheck } from '../types/auth.types';

// Change the db import to use sequelize directly
// import { db } from '../db';

export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserWithRoles | null> {
    return userRepository.findByIdWithRoles(id);
  }

  /**
   * Get user with permissions
   */
  async getUserWithPermissions(id: number) {
    return userRepository.findByIdWithPermissions(id);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(id: number, profileData: UserProfileUpdateRequest): Promise<UserWithRoles | null> {
    const [updated, users] = await userRepository.updateProfile(id, profileData);
    
    if (updated === 0 || users.length === 0) {
      return null;
    }
    
    return userRepository.findByIdWithRoles(id);
  }

  /**
   * Update user status
   */
  async updateUserStatus(id: number, status: UserStatus): Promise<boolean> {
    const [updated] = await userRepository.updateStatus(id, status);
    return updated > 0;
  }

  /**
   * Get users with pagination
   */
  async getUsers(page: number = 1, limit: number = 20): Promise<{ users: UserPublicProfile[]; total: number }> {
    const { users, total } = await userRepository.findAll(page, limit);
    
    // Map to public profiles
    const publicProfiles = await Promise.all(users.map(async (user) => {
      const userWithRoles = await userRepository.findByIdWithRoles(user.id);
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        roles: userWithRoles?.roles?.map(role => role.name) || [],
        createdAt: user.createdAt,
      };
    }));
    
    return {
      users: publicProfiles,
      total,
    };
  }

  /**
   * Add role to user
   */
  async addUserRole(userId: number, roleName: string): Promise<boolean> {
    // Find role by name
    const role = await roleRepository.findByName(roleName);
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }
    
    // Add role to user
    const transaction = await sequelize.transaction();
    
    try {
      await userRepository.addRole(userId, role.id, transaction);
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeUserRole(userId: number, roleName: string): Promise<boolean> {
    // Find role by name
    const role = await roleRepository.findByName(roleName);
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }
    
    // Remove role from user
    const transaction = await sequelize.transaction();
    
    try {
      await userRepository.removeRole(userId, role.id, transaction);
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: number, check: PermissionCheck): Promise<boolean> {
    const userWithPermissions = await userRepository.findByIdWithPermissions(userId);
    
    if (!userWithPermissions || !userWithPermissions.roles || userWithPermissions.roles.length === 0) {
      return false;
    }
    
    // Check if the user has admin role (which grants all permissions)
    const isAdmin = userWithPermissions.roles.some(role => role.name === 'admin');
    if (isAdmin) {
      return true;
    }
    
    // Check specific permissions
    for (const role of userWithPermissions.roles) {
      // Skip roles without permissions
      if (!role.permissions || !Array.isArray(role.permissions)) continue;
      
      const hasPermission = role.permissions.some((permission: any) => 
        permission.resource === check.resource && permission.action === check.action
      );
      
      if (hasPermission) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if user has role
   */
  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const userWithRoles = await userRepository.findByIdWithRoles(userId);
    
    if (!userWithRoles || !userWithRoles.roles || userWithRoles.roles.length === 0) {
      return false;
    }
    
    return userWithRoles.roles.some(role => role.name === roleName);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<boolean> {
    const deleted = await userRepository.deleteUser(id);
    return deleted > 0;
  }

  /**
   * Get total users count
   */
  async getTotalUsersCount(): Promise<number> {
    const result = await sequelize.query(
      'SELECT COUNT(id) as count FROM users',
      { type: QueryTypes.SELECT }
    ) as Array<{ count: string | number }>;
    
    return result[0]?.count ? Number(result[0].count) : 0;
  }

  /**
   * Get recent user statistics for the last X days
   * @param days Number of days to look back
   */
  async getRecentUserStats(days: number): Promise<any> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const [newUsersResult] = await sequelize.query(
      'SELECT COUNT(id) as count FROM users WHERE created_at >= :dateLimit',
      { 
        replacements: { dateLimit },
        type: QueryTypes.SELECT 
      }
    ) as Array<{ count: string | number }>;

    const [activeUsersResult] = await sequelize.query(
      'SELECT COUNT(id) as count FROM users WHERE last_login_at >= :dateLimit',
      { 
        replacements: { dateLimit },
        type: QueryTypes.SELECT 
      }
    ) as Array<{ count: string | number }>;

    return {
      newUsers: newUsersResult?.count ? Number(newUsersResult.count) : 0,
      activeUsers: activeUsersResult?.count ? Number(activeUsersResult.count) : 0,
      period: days
    };
  }

  /**
   * Find a user by ID
   * @param userId User ID
   */
  async findById(userId: number): Promise<any> {
    const [user] = await sequelize.query(
      'SELECT * FROM users WHERE id = :userId LIMIT 1',
      { 
        replacements: { userId },
        type: QueryTypes.SELECT 
      }
    ) as Array<any>;
    
    return user;
  }

  /**
   * Find a user by email
   * @param email User email
   */
  async findByEmail(email: string): Promise<any> {
    const [user] = await sequelize.query(
      'SELECT * FROM users WHERE email = :email LIMIT 1',
      { 
        replacements: { email },
        type: QueryTypes.SELECT 
      }
    ) as Array<any>;
    
    return user;
  }
}

export default new UserService();