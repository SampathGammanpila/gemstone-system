import { User } from '../db/models/user.model';
import userRepository from '../db/repositories/user.repository';
import roleRepository from '../db/repositories/role.repository';
import verificationRepository from '../db/repositories/verification.repository';
import { UserRegistrationRequest, UserLoginRequest, UserStatus, VerificationType, UserPublicProfile, UserRole } from '../types/user.types';
import { TokenPayload, AuthResponse, TokenVerificationResponse, RefreshTokenRequest } from '../types/auth.types';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../utils/jwtHelper';
import { generateToken } from '../utils/tokenGenerator';
import { comparePassword } from '../utils/encryption';
import emailService from './email.service';
import { Transaction } from 'sequelize';
import { sequelize } from '../db';
import crypto from 'crypto';
import config from '../config/auth';

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: UserRegistrationRequest): Promise<User> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user with transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Create user
      const user = await userRepository.createUser({
        ...userData,
        status: UserStatus.PENDING,
        isEmailVerified: false,
      }, transaction);

      // Get customer role
      const customerRole = await roleRepository.findByName(UserRole.CUSTOMER);
      if (!customerRole) {
        throw new Error('Customer role not found');
      }

      // Assign customer role to user
      await userRepository.addRole(user.id, customerRole.id, transaction);

      // Create verification token
      const verification = await verificationRepository.createVerification(
        user.id,
        VerificationType.EMAIL_VERIFICATION,
        72, // 72 hours expiry
        transaction
      );

      // Send verification email
      await emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verification.token
      );

      await transaction.commit();
      return user;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Login a user
   */
  async login(loginData: UserLoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING) {
      throw new Error('Your account is not active. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await user.validatePassword(loginData.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Get user with roles
    const userWithRoles = await userRepository.findByIdWithRoles(user.id);
    if (!userWithRoles) {
      throw new Error('User data not found');
    }

    // Create token payload
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles: userWithRoles.roles?.map(role => role.name) || [],
    };

    // Generate tokens
    const tokens = generateTokens(tokenPayload);

    // Update refresh token in database
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    // Update last login time
    await userRepository.updateLastLogin(user.id);

    // Create user profile for response
    const userProfile: UserPublicProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      roles: userWithRoles.roles?.map(role => role.name) || [],
      createdAt: user.createdAt,
    };

    return {
      user: userProfile,
      tokens,
    };
  }

  /**
   * Logout a user
   */
  async logout(userId: number): Promise<boolean> {
    try {
      // Clear refresh token
      await userRepository.updateRefreshToken(userId, null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AuthResponse | null> {
    const { refreshToken } = refreshTokenRequest;

    // Verify refresh token
    const verification = verifyRefreshToken(refreshToken);
    if (!verification.isValid || !verification.payload) {
      return null;
    }

    // Find user by token
    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      return null;
    }

    // Get user with roles
    const userWithRoles = await userRepository.findByIdWithRoles(user.id);
    if (!userWithRoles) {
      return null;
    }

    // Create token payload
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles: userWithRoles.roles?.map(role => role.name) || [],
    };

    // Generate new tokens
    const tokens = generateTokens(tokenPayload);

    // Update refresh token in database
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    // Create user profile for response
    const userProfile: UserPublicProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      roles: userWithRoles.roles?.map(role => role.name) || [],
      createdAt: user.createdAt,
    };

    return {
      user: userProfile,
      tokens,
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    // Find verification record
    const verification = await verificationRepository.findByToken(token);
    if (!verification || verification.type !== VerificationType.EMAIL_VERIFICATION) {
      return false;
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Mark verification as used
      await verificationRepository.markAsUsed(verification.id, transaction);

      // Update user verification status
      await userRepository.setEmailVerified(verification.userId, transaction);

      // Set user status to active if it was pending
      const user = await userRepository.findById(verification.userId);
      if (user && user.status === UserStatus.PENDING) {
        await userRepository.updateStatus(user.id, UserStatus.ACTIVE, transaction);
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      return false;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return true;
    }

    // Generate token
    const token = generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + config.verification.passwordResetTokenExpiry);

    // Save token to database
    await userRepository.setPasswordResetToken(user.id, token, expires);

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      token
    );

    return true;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find user by reset token
    const user = await userRepository.findByPasswordResetToken(token);
    if (!user) {
      return false;
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Update user's password
      await userRepository.updatePassword(user.id, newPassword, transaction);

      // Invalidate all refresh tokens by setting to null
      await userRepository.updateRefreshToken(user.id, null, transaction);

      // Send password changed notification
      await emailService.sendPasswordChangedEmail(
        user.email,
        user.firstName
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      return false;
    }
  }

  /**
   * Verify access token
   */
  verifyToken(token: string): TokenVerificationResponse {
    return verifyAccessToken(token);
  }

  /**
   * Get user info by ID
   */
  async getUserProfile(userId: number): Promise<UserPublicProfile | null> {
    const userWithRoles = await userRepository.findByIdWithRoles(userId);
    if (!userWithRoles) {
      return null;
    }

    return {
      id: userWithRoles.id,
      firstName: userWithRoles.firstName,
      lastName: userWithRoles.lastName,
      profileImage: userWithRoles.profileImage,
      roles: userWithRoles.roles?.map(role => role.name) || [],
      createdAt: userWithRoles.createdAt,
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    // Find user
    const user = await userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // Verify current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Update password
      await userRepository.updatePassword(user.id, newPassword, transaction);

      // Invalidate all refresh tokens
      await userRepository.updateRefreshToken(user.id, null, transaction);

      // Send password changed notification
      await emailService.sendPasswordChangedEmail(
        user.email,
        user.firstName
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      return false;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<boolean> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return true;
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return true;
    }

    // Check for rate limiting
    const recentVerifications = await verificationRepository.countRecentByUserAndType(
      user.id,
      VerificationType.EMAIL_VERIFICATION,
      30 // Check last 30 minutes
    );

    if (recentVerifications >= 3) {
      throw new Error('Too many verification emails have been sent recently. Please try again later.');
    }

    // Invalidate previous verification tokens
    await verificationRepository.invalidateAllForUser(
      user.id,
      VerificationType.EMAIL_VERIFICATION
    );

    // Create new verification token
    const verification = await verificationRepository.createVerification(
      user.id,
      VerificationType.EMAIL_VERIFICATION,
      72 // 72 hours expiry
    );

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      verification.token
    );

    return true;
  }
}

export default new AuthService();