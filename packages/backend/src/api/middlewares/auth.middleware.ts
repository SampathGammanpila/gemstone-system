import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/environment';
import { UserRepository } from '../../db/repositories/user.repository';
import { logger } from '../../utils/logger';
import { AppError } from './error.middleware';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
      roles?: string[];
      permissions?: string[];
    }
  }
}

// JWT Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required. Please log in.');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    if (!decoded || !decoded.userId) {
      throw new AppError(401, 'Invalid authentication token.');
    }
    
    // Get user from database
    const userRepository = new UserRepository();
    const userData = await userRepository.getUserWithRoles(decoded.userId);
    
    if (!userData) {
      throw new AppError(401, 'User not found or inactive.');
    }
    
    if (!userData.user.is_active) {
      throw new AppError(401, 'User account is deactivated.');
    }
    
    // Get user permissions
    const permissions = await userRepository.getUserPermissions(decoded.userId);
    
    // Attach user data to request
    req.user = userData.user;
    req.userId = userData.user.id;
    req.roles = userData.roles.map(role => role.name);
    req.permissions = permissions;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token. Please log in again.'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expired. Please log in again.'));
    } else {
      next(error);
    }
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }
    
    if (roles.length === 0) {
      // No specific roles required
      next();
      return;
    }
    
    // Check if user has any of the required roles
    const hasRole = req.roles?.some(role => roles.includes(role));
    
    if (!hasRole) {
      next(new AppError(403, 'You do not have permission to access this resource'));
      return;
    }
    
    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (requiredPermissions: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }
    
    if (requiredPermissions.length === 0) {
      // No specific permissions required
      next();
      return;
    }
    
    // Check if user has all required permissions
    const hasPermissions = requiredPermissions.every(
      permission => req.permissions?.includes(permission)
    );
    
    if (!hasPermissions) {
      next(new AppError(403, 'You do not have the required permissions to access this resource'));
      return;
    }
    
    next();
  };
};