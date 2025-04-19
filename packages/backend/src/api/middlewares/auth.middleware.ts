import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../../utils/jwtHelper';

/**
 * Authentication middleware
 * Verifies the JWT token from the Authorization header
 * and adds the decoded user info to the request object
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }
    
    // Verify token
    const verification = verifyAccessToken(token);
    
    if (!verification.isValid || !verification.payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }
    
    // Add user info to request
    (req as any).userId = verification.payload.userId;
    (req as any).email = verification.payload.email;
    (req as any).roles = verification.payload.roles;
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Optional authentication middleware
 * Tries to verify the JWT token but continues even if not present
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      // Continue without authentication
      next();
      return;
    }
    
    // Verify token
    const verification = verifyAccessToken(token);
    
    if (verification.isValid && verification.payload) {
      // Add user info to request
      (req as any).userId = verification.payload.userId;
      (req as any).email = verification.payload.email;
      (req as any).roles = verification.payload.roles;
    }
    
    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

/**
 * Middleware to check if user is verified
 * Must be used after authenticate middleware
 */
export const requireVerifiedEmail = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // The auth middleware adds email to the request
    const isVerified = (req as any).isEmailVerified;
    
    if (!isVerified) {
      res.status(403).json({
        success: false,
        message: 'Email verification required',
      });
      return;
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

export default {
  authenticate,
  optionalAuthenticate,
  requireVerifiedEmail,
};