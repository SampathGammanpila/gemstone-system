import { Request, Response, NextFunction } from 'express';
import userService from '../../services/user.service';
import { PermissionCheck } from '../../types/auth.types';

/**
 * Role check middleware
 * Checks if user has at least one of the specified roles
 * @param roles Array of role names to check
 */
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userRoles = (req as any).roles;
      
      if (!userRoles || !Array.isArray(userRoles)) {
        res.status(403).json({
          success: false,
          message: 'Access denied: Missing role information',
        });
        return;
      }
      
      // Check if user has any of the required roles
      const hasRequiredRole = roles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient role permissions',
        });
        return;
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking role permissions',
      });
    }
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = hasRole(['admin']);

/**
 * Check if user is customer
 */
export const isCustomer = hasRole(['customer']);

/**
 * Check if user is dealer
 */
export const isDealer = hasRole(['dealer']);

/**
 * Check if user is cutter
 */
export const isCutter = hasRole(['cutter']);

/**
 * Check if user is appraiser
 */
export const isAppraiser = hasRole(['appraiser']);

/**
 * Check if user is professional (dealer, cutter, or appraiser)
 */
export const isProfessional = hasRole(['dealer', 'cutter', 'appraiser']);

/**
 * Permission check middleware
 * Checks if user has the specified permission
 * @param resource Resource name
 * @param action Action name
 */
export const hasPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: Authentication required',
        });
        return;
      }
      
      // Check for admin role first (admins have all permissions)
      const userRoles = (req as any).roles;
      if (userRoles && userRoles.includes('admin')) {
        next();
        return;
      }
      
      // Check specific permission
      const permissionCheck: PermissionCheck = { resource, action };
      const hasPermission = await userService.hasPermission(userId, permissionCheck);
      
      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
        return;
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking permissions',
      });
    }
  };
};

export default {
  hasRole,
  isAdmin,
  isCustomer,
  isDealer,
  isCutter,
  isAppraiser,
  isProfessional,
  hasPermission,
};