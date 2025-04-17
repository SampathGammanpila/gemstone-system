import { BaseRepository } from './base.repository';
import { User, Role } from '../../types/database-types';
import { db } from '../index';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  /**
   * Find a user by email address
   * @param email - User email address
   * @returns Promise with the user or undefined if not found
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOneByField('email', email);
  }

  /**
   * Get user with their roles
   * @param userId - User ID
   * @returns Promise with user and their roles
   */
  async getUserWithRoles(userId: string): Promise<{ user: User; roles: Role[] } | null> {
    const user = await this.findById(userId);
    
    if (!user) {
      return null;
    }
    
    const roles = await db('roles')
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', userId)
      .select('roles.*');
    
    return { user, roles };
  }

  /**
   * Add a role to a user
   * @param userId - User ID
   * @param roleId - Role ID
   * @returns Promise indicating success
   */
  async addRoleToUser(userId: string, roleId: number): Promise<void> {
    await db('user_roles').insert({
      user_id: userId,
      role_id: roleId,
    });
  }

  /**
   * Remove a role from a user
   * @param userId - User ID
   * @param roleId - Role ID
   * @returns Promise with number of rows affected
   */
  async removeRoleFromUser(userId: string, roleId: number): Promise<number> {
    return db('user_roles')
      .where({
        user_id: userId,
        role_id: roleId,
      })
      .delete();
  }

  /**
   * Check if a user has a specific role
   * @param userId - User ID
   * @param roleName - Role name
   * @returns Promise with boolean indicating if the user has the role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const result = await db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where({
        'user_roles.user_id': userId,
        'roles.name': roleName,
      })
      .count({ count: '*' })
      .first();
    
    return result?.count > 0;
  }

  /**
   * Get a user's permissions
   * @param userId - User ID
   * @returns Promise with array of permission names
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const permissions = await db('permissions')
      .join('role_permissions', 'permissions.id', 'role_permissions.permission_id')
      .join('user_roles', 'role_permissions.role_id', 'user_roles.role_id')
      .where('user_roles.user_id', userId)
      .select('permissions.name')
      .distinct();
    
    return permissions.map(p => p.name);
  }

  /**
   * Update user's last login timestamp
   * @param userId - User ID
   * @returns Promise with updated user
   */
  async updateLastLogin(userId: string): Promise<User | undefined> {
    return this.update(userId, {
      last_login: new Date(),
    });
  }

  /**
   * Find users with pagination, sorting, and filtering
   * @param page - Page number
   * @param limit - Records per page
   * @param sort - Sort field
   * @param order - Sort direction ('asc' or 'desc')
   * @param filter - Filter conditions
   * @returns Promise with users and total count
   */
  async findUsers(
    page = 1,
    limit = 10,
    sort = 'created_at',
    order: 'asc' | 'desc' = 'desc',
    filter: Partial<User> = {}
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await this.count(filter);
    
    // Build query
    const query = db(this.tableName)
      .where(filter)
      .orderBy(sort, order)
      .limit(limit)
      .offset(offset);
    
    const users = await query;
    
    return { users, total };
  }

  /**
   * Create a new user with roles
   * @param userData - User data
   * @param roleIds - Array of role IDs
   * @returns Promise with created user
   */
  async createUserWithRoles(userData: Partial<User>, roleIds: number[] = []): Promise<User> {
    return db.transaction(async (trx) => {
      // Insert user
      const [user] = await trx('users')
        .insert(userData)
        .returning('*');
      
      // Assign roles
      if (roleIds.length > 0) {
        const userRoles = roleIds.map(roleId => ({
          user_id: user.id,
          role_id: roleId,
        }));
        
        await trx('user_roles').insert(userRoles);
      }
      
      return user;
    });
  }
}