import { Transaction } from 'sequelize';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { UserStatus, UserAttributes, UserWithRoles, UserProfileUpdateRequest, UserWithPermissions, UserCreationAttributes } from '../../types/user.types';

export class UserRepository {
  /**
   * Create a new user
   */
  async createUser(userData: UserCreationAttributes, transaction?: Transaction): Promise<User> {
    return User.create(userData, { transaction });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  /**
   * Find user by id
   */
  async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  /**
   * Find user by id with associated roles
   */
  async findByIdWithRoles(id: number): Promise<UserWithRoles | null> {
    const user = await User.findByPk(id, {
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) return null;

    return user.toJSON() as UserWithRoles;
  }

  /**
   * Find user by id with roles and permissions
   */
  async findByIdWithPermissions(id: number): Promise<UserWithPermissions | null> {
    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) return null;

    return user.toJSON() as UserWithPermissions;
  }

  /**
   * Find user by refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return User.findOne({ where: { refreshToken } });
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    return User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Symbol.for('gt')]: new Date(),
        },
      },
    });
  }

  /**
   * Update user data
   */
  async updateUser(id: number, userData: Partial<UserAttributes>, transaction?: Transaction): Promise<[number, User[]]> {
    return User.update(userData, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(id: number, profileData: UserProfileUpdateRequest, transaction?: Transaction): Promise<[number, User[]]> {
    return User.update(profileData, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Update user status
   */
  async updateStatus(id: number, status: UserStatus, transaction?: Transaction): Promise<[number, User[]]> {
    return User.update({ status }, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Update user's refresh token
   */
  async updateRefreshToken(id: number, refreshToken: string | null, transaction?: Transaction): Promise<[number, User[]]> {
    return User.update({ refreshToken }, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Set user's email as verified
   */
  async setEmailVerified(id: number, transaction?: Transaction): Promise<[number, User[]]> {
    return User.update({ isEmailVerified: true }, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Update password reset token
   */
  async setPasswordResetToken(id: number, token: string, expires: Date, transaction?: Transaction): Promise<[number, User[]]> {
    return User.update({
      passwordResetToken: token,
      passwordResetExpires: expires,
    }, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Update user's password
   */
  async updatePassword(id: number, password: string, transaction?: Transaction): Promise<[number, User[]]> {
    return User.update({
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
    }, {
      where: { id },
      returning: true,
      transaction,
      individualHooks: true, // Ensure password hashing hooks run
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: number, transaction?: Transaction): Promise<[number, User[]]> {
    return User.update({
      lastLoginAt: new Date(),
    }, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(id: number, transaction?: Transaction): Promise<number> {
    return User.destroy({
      where: { id },
      transaction,
    });
  }

  /**
   * Find all users with pagination
   */
  async findAll(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      users: rows,
      total: count,
    };
  }

  /**
   * Add role to user
   */
  async addRole(userId: number, roleId: number, transaction?: Transaction): Promise<void> {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new Error('User not found');

    const role = await Role.findByPk(roleId, { transaction });
    if (!role) throw new Error('Role not found');

    // @ts-ignore - TypeScript doesn't recognize the association methods
    await user.addRole(role, { transaction });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: number, roleId: number, transaction?: Transaction): Promise<void> {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new Error('User not found');

    // @ts-ignore - TypeScript doesn't recognize the association methods
    await user.removeRole(roleId, { transaction });
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: number): Promise<Role[]> {
    const user = await User.findByPk(userId, {
      include: [{ model: Role }],
    });
    
    if (!user) throw new Error('User not found');
    
    // @ts-ignore - TypeScript doesn't recognize the association
    return user.Roles || [];
  }
}

export default new UserRepository();