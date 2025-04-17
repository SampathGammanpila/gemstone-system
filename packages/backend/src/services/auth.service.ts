import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/environment';
import { UserRepository } from '../db/repositories/user.repository';
import { AppError } from '../api/middlewares/error.middleware';
import { logger } from '../utils/logger';
import { EmailService } from './email.service';
import { User, Role } from '../types/database-types';

export class AuthService {
  private userRepository: UserRepository;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
  }

  /**
   * Register a new user
   * @param userData - User data for registration
   * @returns User object and verification token
   */
  public async register(userData: Partial<User>): Promise<{ user: User; verificationToken: string }> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(
        userData.password as string,
        config.bcryptSaltRounds
      );
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Create user with customer role
      const user = await this.userRepository.createUserWithRoles(
        {
          ...userData,
          password: hashedPassword,
          verification_token: verificationToken,
          is_email_verified: false,
          is_active: true
        },
        [1] // Default 'customer' role (ID: 1)
      );
      
      return { user, verificationToken };
    } catch (error) {
      logger.error('Registration failed', error);
      throw new AppError(500, 'Registration failed');
    }
  }

  /**
   * Login user
   * @param email - User email
   * @param password - User password
   * @returns User object and tokens
   */
  public async login(email: string, password: string): Promise<{ 
    user: User & { roles: string[] }; 
    token: string; 
    refreshToken: string;
  }> {
    try {
      // Get user with roles
      const userData = await this.userRepository.getUserWithRoles(email);
      
      if (!userData) {
        throw new AppError(401, 'Invalid email or password');
      }
      
      const { user, roles } = userData;
      
      // Check if user is active
      if (!user.is_active) {
        throw new AppError(401, 'Account is deactivated');
      }
      
      // Check if password is correct
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      
      if (!isPasswordCorrect) {
        throw new AppError(401, 'Invalid email or password');
      }
      
      // Update last login
      await this.userRepository.updateLastLogin(user.id);
      
      // Generate tokens
      const token = this.generateToken(user.id, roles.map(role => role.name));
      const refreshToken = this.generateRefreshToken(user.id);
      
      return { 
        user: { 
          ...user, 
          roles: roles.map(role => role.name) 
        }, 
        token, 
        refreshToken 
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Login failed', error);
      throw new AppError(500, 'Login failed');
    }
  }

  /**
   * Verify email address
   * @param token - Verification token
   * @returns Updated user object
   */
  public async verifyEmail(token: string): Promise<User> {
    try {
      // Find user by verification token
      const user = await this.userRepository.findOneByField('verification_token', token);
      
      if (!user) {
        throw new AppError(400, 'Invalid or expired verification token');
      }
      
      // Update user
      const updatedUser = await this.userRepository.update(user.id, {
        is_email_verified: true,
        verification_token: undefined
      });
      
      if (!updatedUser) {
        throw new AppError(500, 'Failed to verify email');
      }
      
      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Email verification failed', error);
      throw new AppError(500, 'Email verification failed');
    }
  }

  /**
   * Generate password reset token
   * @param userId - User ID
   * @returns Reset token
   */
  public async generatePasswordResetToken(userId: string): Promise<string> {
    try {
      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set token expiry (1 hour)
      const resetTokenExpires = new Date();
      resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
      
      // Update user
      await this.userRepository.update(userId, {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires
      });
      
      return resetToken;
    } catch (error) {
      logger.error('Failed to generate reset token', error);
      throw new AppError(500, 'Failed to generate reset token');
    }
  }

  /**
   * Reset password
   * @param token - Reset token
   * @param newPassword - New password
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find user by reset token
      const user = await this.userRepository.findOneByField('reset_token', token);
      
      if (!user) {
        throw new AppError(400, 'Invalid or expired reset token');
      }
      
      // Check if token is expired
      if (user.reset_token_expires && user.reset_token_expires < new Date()) {
        throw new AppError(400, 'Reset token has expired');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
      
      // Update user
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        reset_token: undefined,
        reset_token_expires: undefined
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Password reset failed', error);
      throw new AppError(500, 'Password reset failed');
    }
  }

  /**
   * Change password
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Get user
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      
      // Verify current password
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordCorrect) {
        throw new AppError(400, 'Current password is incorrect');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
      
      // Update user
      await this.userRepository.update(userId, {
        password: hashedPassword
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Password change failed', error);
      throw new AppError(500, 'Password change failed');
    }
  }

  /**
   * Generate JWT token
   * @param userId - User ID
   * @param roles - User roles
   * @returns JWT token
   */
  public generateToken(userId: string, roles: string[]): string {
    const payload = { userId, roles };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry as any });
  }

  /**
   * Generate refresh token
   * @param userId - User ID
   * @returns Refresh token
   */
  public generateRefreshToken(userId: string): string {
    // In a production environment, you would store refresh tokens in a database
    // and implement token rotation/invalidation logic
    const payload = { userId, type: 'refresh' };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' as any });
  }

  /**
   * Refresh access token
   * @param refreshToken - Refresh token
   * @returns New access and refresh tokens
   */
  public async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as any;
      
      if (!decoded || !decoded.userId || decoded.type !== 'refresh') {
        throw new AppError(401, 'Invalid refresh token');
      }
      
      // Get user with roles
      const userData = await this.userRepository.getUserWithRoles(decoded.userId);
      
      if (!userData) {
        throw new AppError(401, 'User not found');
      }
      
      // Check if user is active
      if (!userData.user.is_active) {
        throw new AppError(401, 'Account is deactivated');
      }
      
      // Generate new tokens
      const token = this.generateToken(
        userData.user.id,
        userData.roles.map(role => role.name)
      );
      const newRefreshToken = this.generateRefreshToken(userData.user.id);
      
      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, 'Invalid or expired refresh token');
      }
      
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Token refresh failed', error);
      throw new AppError(500, 'Token refresh failed');
    }
  }

  /**
   * Invalidate refresh token
   * @param refreshToken - Refresh token
   */
  public async invalidateRefreshToken(refreshToken: string): Promise<void> {
    // In a production system, you would implement token blacklisting or
    // a token versioning system to invalidate refresh tokens
    // For simplicity, we'll assume this happens without error
    return Promise.resolve();
  }

  /**
   * Send verification email
   * @param email - User email
   * @param token - Verification token
   */
  public async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.corsOrigin}/verify-email/${token}`;
    
    const subject = 'Verify Your Email Address';
    const html = `
      <h1>Email Verification</h1>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email Address</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not register for an account, please ignore this email.</p>
    `;
    
    await this.emailService.sendEmail(email, subject, html);
  }

  /**
   * Send password reset email
   * @param email - User email
   * @param token - Reset token
   */
  public async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.corsOrigin}/reset-password/${token}`;
    
    const subject = 'Reset Your Password';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;
    
    await this.emailService.sendEmail(email, subject, html);
  }
}