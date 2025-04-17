import bcrypt from 'bcrypt';
import { UserRepository } from '../db/repositories/user.repository';
import { AppError } from '../api/middlewares/error.middleware';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { User } from '../types/database-types';
import { FileService } from './file.service';

export class UserService {
  private userRepository: UserRepository;
  private fileService: FileService;

  constructor() {
    this.userRepository = new UserRepository();
    this.fileService = new FileService();
  }

  /**
   * Find user by ID
   * @param userId - User ID
   * @returns User object
   */
  public async findById(userId: string): Promise<User | undefined> {
    return this.userRepository.findById(userId);
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User object
   */
  public async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Get user with roles
   * @param userId - User ID
   * @returns User object with roles
   */
  public async getUserWithRoles(userId: string): Promise<{ user: User; roles: any[] } | null> {
    return this.userRepository.getUserWithRoles(userId);
  }

  /**
   * Get all users
   * @param page - Page number
   * @param limit - Users per page
   * @param sort - Sort field
   * @param order - Sort direction
   * @param filter - Filter conditions
   * @returns Users and total count
   */
  public async getAllUsers(
    page: number = 1,
    limit: number = 10,
    sort: string = 'created_at',
    order: 'asc' | 'desc' = 'desc',
    filter: Partial<User> = {}
  ): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findUsers(page, limit, sort, order, filter);
  }

  /**
   * Create a new user
   * @param userData - User data
   * @param roleIds - Role IDs to assign
   * @returns Created user
   */
  public async createUser(userData: Partial<User>, roleIds: number[] = [1]): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(userData.email as string);
      
      if (existingUser) {
        throw new AppError(409, 'User with this email already exists');
      }
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, config.bcryptSaltRounds);
      }
      
      // Create user with roles
      const user = await this.userRepository.createUserWithRoles(userData, roleIds);
      
      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to create user', error);
      throw new AppError(500, 'Failed to create user');
    }
  }

  /**
   * Update user
   * @param userId - User ID
   * @param userData - Updated user data
   * @returns Updated user
   */
  public async updateUser(userId: string, userData: Partial<User>): Promise<User | undefined> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      
      if (!existingUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Check if email is being changed and already exists
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await this.userRepository.findByEmail(userData.email);
        
        if (emailExists) {
          throw new AppError(409, 'Email already in use');
        }
      }
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, config.bcryptSaltRounds);
      }
      
      // Update user
      const updatedUser = await this.userRepository.update(userId, userData);
      
      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to update user', error);
      throw new AppError(500, 'Failed to update user');
    }
  }

  /**
   * Delete user
   * @param userId - User ID
   * @returns True if deleted
   */
  public async deleteUser(userId: string): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      
      if (!existingUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Delete user
      const result = await this.userRepository.delete(userId);
      
      return result > 0;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to delete user', error);
      throw new AppError(500, 'Failed to delete user');
    }
  }

  /**
   * Upload profile image
   * @param userId - User ID
   * @param file - Uploaded file
   * @returns Updated user
   */
  public async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<User | undefined> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      
      if (!existingUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Delete old profile image if exists
      if (existingUser.profile_image_url) {
        await this.fileService.deleteFile(existingUser.profile_image_url);
      }
      
      // Upload new image
      const imagePath = await this.fileService.saveFile(file, 'users');
      
      // Update user
      const updatedUser = await this.userRepository.update(userId, {
        profile_image_url: imagePath
      });
      
      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to upload profile image', error);
      throw new AppError(500, 'Failed to upload profile image');
    }
  }

  /**
   * Add role to user
   * @param userId - User ID
   * @param roleId - Role ID
   */
  public async addRoleToUser(userId: string, roleId: number): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      
      if (!existingUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Add role to user
      await this.userRepository.addRoleToUser(userId, roleId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to add role to user', error);
      throw new AppError(500, 'Failed to add role to user');
    }
  }

  /**
   * Remove role from user
   * @param userId - User ID
   * @param roleId - Role ID
   * @returns True if removed
   */
  public async removeRoleFromUser(userId: string, roleId: number): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      
      if (!existingUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Remove role from user
      const result = await this.userRepository.removeRoleFromUser(userId, roleId);
      
      return result > 0;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to remove role from user', error);
      throw new AppError(500, 'Failed to remove role from user');
    }
  }

  /**
   * Check if user has role
   * @param userId - User ID
   * @param roleName - Role name
   * @returns True if user has role
   */
  public async hasRole(userId: string, roleName: string): Promise<boolean> {
    return this.userRepository.hasRole(userId, roleName);
  }

  /**
   * Get user permissions
   * @param userId - User ID
   * @returns Array of permission names
   */
  public async getUserPermissions(userId: string): Promise<string[]> {
    return this.userRepository.getUserPermissions(userId);
  }

  /**
   * Activate or deactivate user
   * @param userId - User ID
   * @param isActive - Activation status
   * @returns Updated user
   */
  public async setUserActiveStatus(userId: string, isActive: boolean): Promise<User | undefined> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      
      if (!existingUser) {
        throw new AppError(404, 'User not found');
      }
      
      // Update user
      const updatedUser = await this.userRepository.update(userId, {
        is_active: isActive
      });
      
      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to update user active status', error);
      throw new AppError(500, 'Failed to update user active status');
    }
  }
}