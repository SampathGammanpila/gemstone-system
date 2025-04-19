import { Request, Response } from 'express';
import authService from '../../services/auth.service';
import { UserRegistrationRequest, UserLoginRequest } from '../../types/user.types';
import { RefreshTokenRequest } from '../../types/auth.types';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: UserRegistrationRequest = req.body;
      
      const user = await authService.register(userData);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        userId: user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
      } else {
        console.error('Registration error:', error);
        res.status(500).json({
          success: false,
          message: 'An error occurred during registration',
        });
      }
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: UserLoginRequest = req.body;
      
      const authResponse = await authService.login(loginData);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: authResponse,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // The auth middleware adds userId to the request
      const userId = (req as any).userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      
      await authService.logout(userId);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred during logout',
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshTokenRequest: RefreshTokenRequest = req.body;
      
      const authResponse = await authService.refreshToken(refreshTokenRequest);
      
      if (!authResponse) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: authResponse,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while refreshing token',
      });
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      
      const verified = await authService.verifyEmail(token);
      
      if (!verified) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred during email verification',
      });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      await authService.requestPasswordReset(email);
      
      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request',
      });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      
      const resetSuccess = await authService.resetPassword(token, password);
      
      if (!resetSuccess) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred during password reset',
      });
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { currentPassword, newPassword } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      
      const changeSuccess = await authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      
      if (!changeSuccess) {
        res.status(400).json({
          success: false,
          message: 'Password change failed',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('incorrect')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An error occurred during password change',
        });
      }
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      
      const userProfile = await authService.getUserProfile(userId);
      
      if (!userProfile) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
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
   * Resend verification email
   */
  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      await authService.resendVerificationEmail(email);
      
      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If the email exists and is not verified, a new verification email has been sent',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Too many')) {
        res.status(429).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An error occurred while processing your request',
        });
      }
    }
  }
}

export default new AuthController();