import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service';
import { logger } from '../../utils/logger';
import { AppError } from '../middlewares/error.middleware';
import { AuditActions, EntityTypes } from '../middlewares/audit.middleware';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get current user profile
   * @route GET /api/users/profile
   */
  public getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }
      
      // Get user data
      const userData = await this.userService.getUserWithRoles(userId);
      
      if (!userData) {
        throw new AppError(404, 'User not found');
      }
      
      // Return user data
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: userData.user.id,
            email: userData.user.email,
            first_name: userData.user.first_name,
            last_name: userData.user.last_name,
            phone: userData.user.phone,
            profile_image_url: userData.user.profile_image_url,
            roles: userData.roles.map(role => role.name)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   * @route PUT /api/users/profile
   */
  public updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }
      
      const { first_name, last_name, phone } = req.body;
      
      // Update user
      const updatedUser = await this.userService.updateUser(userId, {
        first_name,
        last_name,
        phone
      });
      
      if (!updatedUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Return updated user data
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            phone: updatedUser.phone,
            profile_image_url: updatedUser.profile_image_url
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload profile image
   * @route POST /api/users/profile/image
   */
  public uploadProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }
      
      if (!req.file) {
        throw new AppError(400, 'No image file provided');
      }
      
      // Upload profile image
      const updatedUser = await this.userService.uploadProfileImage(userId, req.file);
      
      if (!updatedUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Profile image uploaded successfully',
        data: {
          profile_image_url: updatedUser.profile_image_url
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID (admin only)
   * @route GET /api/users/:id
   */
  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Get user data
      const userData = await this.userService.getUserWithRoles(id);
      
      if (!userData) {
        throw new AppError(404, 'User not found');
      }
      
      // Return user data
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: userData.user.id,
            email: userData.user.email,
            first_name: userData.user.first_name,
            last_name: userData.user.last_name,
            phone: userData.user.phone,
            profile_image_url: userData.user.profile_image_url,
            is_email_verified: userData.user.is_email_verified,
            is_active: userData.user.is_active,
            last_login: userData.user.last_login,
            created_at: userData.user.created_at,
            roles: userData.roles.map(role => role.name)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all users (admin only)
   * @route GET /api/users
   */
  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = req.query.sort as string || 'created_at';
      const order = (req.query.order as 'asc' | 'desc') || 'desc';
      
      // Build filter from query params
      const filter: Record<string, any> = {};
      
      if (req.query.email) {
        filter.email = req.query.email;
      }
      
      if (req.query.is_active) {
        filter.is_active = req.query.is_active === 'true';
      }
      
      if (req.query.is_email_verified) {
        filter.is_email_verified = req.query.is_email_verified === 'true';
      }
      
      // Get users
      const { users, total } = await this.userService.getAllUsers(
        page,
        limit,
        sort,
        order,
        filter
      );
      
      // Return users
      res.status(200).json({
        status: 'success',
        data: {
          users: users.map(user => ({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            is_email_verified: user.is_email_verified,
            is_active: user.is_active,
            created_at: user.created_at
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create user (admin only)
   * @route POST /api/users
   */
  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password, first_name, last_name, phone, roles } = req.body;
      
      // Create user
      const userData = {
        email,
        password,
        first_name,
        last_name,
        phone,
        is_email_verified: true, // Admin-created users are verified by default
        is_active: true
      };
      
      // Get role IDs from role names
      const roleIds = roles ? await this.getRoleIds(roles) : [1]; // Default to customer role
      
      // Create user
      const user = await this.userService.createUser(userData, roleIds);
      
      // Return success response
      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            is_email_verified: user.is_email_verified,
            is_active: user.is_active,
            created_at: user.created_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user (admin only)
   * @route PUT /api/users/:id
   */
  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { first_name, last_name, phone, is_active, roles } = req.body;
      
      // Update user basic info
      const updatedUser = await this.userService.updateUser(id, {
        first_name,
        last_name,
        phone,
        is_active
      });
      
      if (!updatedUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Update roles if provided
      if (roles && Array.isArray(roles)) {
        // Get current roles
        const userData = await this.userService.getUserWithRoles(id);
        
        if (userData) {
          const currentRoles = userData.roles.map(role => role.name);
          const rolesToAdd = roles.filter(role => !currentRoles.includes(role));
          const rolesToRemove = currentRoles.filter(role => !roles.includes(role));
          
          // Add new roles
          for (const roleName of rolesToAdd) {
            const roleId = await this.getRoleId(roleName);
            if (roleId) {
              await this.userService.addRoleToUser(id, roleId);
            }
          }
          
          // Remove roles
          for (const roleName of rolesToRemove) {
            const roleId = await this.getRoleId(roleName);
            if (roleId) {
              await this.userService.removeRoleFromUser(id, roleId);
            }
          }
        }
      }
      
      // Get updated user with roles
      const updatedUserData = await this.userService.getUserWithRoles(id);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUserData?.user.id,
            email: updatedUserData?.user.email,
            first_name: updatedUserData?.user.first_name,
            last_name: updatedUserData?.user.last_name,
            phone: updatedUserData?.user.phone,
            is_email_verified: updatedUserData?.user.is_email_verified,
            is_active: updatedUserData?.user.is_active,
            created_at: updatedUserData?.user.created_at,
            roles: updatedUserData?.roles.map(role => role.name)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user (admin only)
   * @route DELETE /api/users/:id
   */
  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Delete user
      const deleted = await this.userService.deleteUser(id);
      
      if (!deleted) {
        throw new AppError(404, 'User not found');
      }
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set user active status (admin only)
   * @route PATCH /api/users/:id/active
   */
  public setUserActiveStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      
      if (typeof is_active !== 'boolean') {
        throw new AppError(400, 'is_active must be a boolean value');
      }
      
      // Update user
      const updatedUser = await this.userService.setUserActiveStatus(id, is_active);
      
      if (!updatedUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: is_active ? 'User activated successfully' : 'User deactivated successfully',
        data: {
          is_active: updatedUser.is_active
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get role ID from role name
   * @param roleName - Role name
   * @returns Role ID
   */
  private async getRoleId(roleName: string): Promise<number | null> {
    try {
      // This is a simplified implementation
      // In a real application, you would query the database to get the role ID
      const roleMap: Record<string, number> = {
        'customer': 1,
        'dealer': 2,
        'cutter': 3,
        'appraiser': 4,
        'admin': 5
      };
      
      return roleMap[roleName] || null;
    } catch (error) {
      logger.error('Failed to get role ID', error);
      return null;
    }
  }

  /**
   * Get role IDs from role names
   * @param roleNames - Array of role names
   * @returns Array of role IDs
   */
  private async getRoleIds(roleNames: string[]): Promise<number[]> {
    const roleIds: number[] = [];
    
    for (const roleName of roleNames) {
      const roleId = await this.getRoleId(roleName);
      if (roleId) {
        roleIds.push(roleId);
      }
    }
    
    return roleIds;
  }
}