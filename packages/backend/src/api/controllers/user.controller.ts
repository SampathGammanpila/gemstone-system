import { Request, Response } from 'express';
import userService from '../../services/user.service';
import { UserProfileUpdateRequest, UserStatus } from '../../types/user.types';

export class UserController {
  /**
   * Get current user profile
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      
      const user = await userService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      // Remove sensitive information
      const { password, refreshToken, passwordResetToken, passwordResetExpires, ...userProfile } = user;
      
      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching user profile',
      });
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const profileData: UserProfileUpdateRequest = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      
      const updatedUser = await userService.updateUserProfile(userId, profileData);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      // Remove sensitive information
      const { password, refreshToken, passwordResetToken, passwordResetExpires, ...userProfile } = updatedUser;
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: userProfile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while updating user profile',
      });
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }
      
      const user = await userService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      // Remove sensitive information
      const { password, refreshToken, passwordResetToken, passwordResetExpires, ...userProfile } = user;
      
      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching user',
      });
    }
  }

  /**
   * Get all users with pagination (admin only)
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      
      const { users, total } = await userService.getUsers(page, limit);
      
      // Set pagination headers
      res.setHeader('X-Total-Count', total.toString());
      
      res.status(200).json({
        success: true,
        data: {
          users,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching users',
      });
    }
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }
      
      if (!Object.values(UserStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user status',
        });
        return;
      }
      
      const updated = await userService.updateUserStatus(userId, status);
      
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while updating user status',
      });
    }
  }

  /**
   * Add role to user (admin only)
   */
  async addUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }
      
      await userService.addUserRole(userId, role);
      
      res.status(200).json({
        success: true,
        message: `Role '${role}' added to user successfully`,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An error occurred while adding role to user',
        });
      }
    }
  }

  /**
   * Remove role from user (admin only)
   */
  async removeUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { id, role } = req.params;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }
      
      await userService.removeUserRole(userId, role);
      
      res.status(200).json({
        success: true,
        message: `Role '${role}' removed from user successfully`,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An error occurred while removing role from user',
        });
      }
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }
      
      const deleted = await userService.deleteUser(userId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while deleting user',
      });
    }
  }
}

export default new UserController();