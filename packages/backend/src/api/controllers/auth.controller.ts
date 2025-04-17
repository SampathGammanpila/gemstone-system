// src/api/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { logger } from '../../utils/logger';
import { AppError } from '../middlewares/error.middleware';
import { AuditActions, EntityTypes } from '../middlewares/audit.middleware';
import { generateCsrfToken } from '../middlewares/csrf.middleware';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  /**
   * Get CSRF token
   * @route GET /api/auth/csrf-token
   */
  public getCsrfToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, expires } = generateCsrfToken();
      
      res.status(200).json({
        status: 'success',
        data: {
          token,
          expires
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  public register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password, first_name, last_name, phone } = req.body;
      
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new AppError(409, 'User with this email already exists');
      }
      
      // Create new user
      const userData = {
        email,
        password,
        first_name,
        last_name,
        phone,
        is_email_verified: false
      };
      
      // Register user
      const { user, verificationToken } = await this.authService.register(userData);
      
      // Send verification email (async)
      this.authService.sendVerificationEmail(user.email, verificationToken)
        .catch(error => {
          logger.error('Failed to send verification email', error);
        });
      
      // Return success response
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please check your email for verification link.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   * @route POST /api/auth/login
   */
  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      // Authenticate user
      const { user, token, refreshToken } = await this.authService.login(email, password);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            roles: user.roles
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email
   * @route GET /api/auth/verify-email/:token
   */
  public verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.params;
      
      // Verify email
      const user = await this.authService.verifyEmail(token);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Forgot password
   * @route POST /api/auth/forgot-password
   */
  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;
      
      // Check if user exists
      const user = await this.userService.findByEmail(email);
      
      if (user) {
        // Generate reset token and send email
        const resetToken = await this.authService.generatePasswordResetToken(user.id);
        
        // Send password reset email (async)
        this.authService.sendPasswordResetEmail(email, resetToken)
          .catch(error => {
            logger.error('Failed to send password reset email', error);
          });
      }
      
      // Always return success to prevent email enumeration
      res.status(200).json({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password
   * @route POST /api/auth/reset-password
   */
  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, password } = req.body;
      
      // Reset password
      await this.authService.resetPassword(token, password);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   * @route POST /api/auth/change-password
   */
  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }
      
      // Change password
      await this.authService.changePassword(userId, current_password, new_password);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh token
   * @route POST /api/auth/refresh-token
   */
  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        throw new AppError(400, 'Refresh token is required');
      }
      
      // Generate new access token
      const { token, refreshToken } = await this.authService.refreshToken(refresh_token);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user
   * @route GET /api/auth/me
   */
  public getCurrentUser = async (
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
   * Logout
   * @route POST /api/auth/logout
   */
  public logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // In a stateless JWT implementation, logging out is primarily a client-side concern
      // However, we can invalidate refresh tokens server-side
      const { refresh_token } = req.body;
      
      if (refresh_token) {
        await this.authService.invalidateRefreshToken(refresh_token);
      }
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}