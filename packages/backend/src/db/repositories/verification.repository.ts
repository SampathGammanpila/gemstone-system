import { Transaction } from 'sequelize';
import { Verification } from '../models/verification.model';
import { VerificationAttributes, VerificationType } from '../../types/user.types';
import crypto from 'crypto';

export class VerificationRepository {
  /**
   * Create a new verification token
   */
  async createVerification(
    userId: number, 
    type: VerificationType, 
    expiresIn: number = 24, // Hours
    transaction?: Transaction
  ): Promise<Verification> {
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresIn);
    
    // Create verification record
    return Verification.create({
      userId,
      token,
      type,
      expiresAt,
      isUsed: false
    }, { transaction });
  }
  
  /**
   * Find verification by token
   */
  async findByToken(token: string): Promise<Verification | null> {
    return Verification.findOne({ 
      where: { 
        token,
        isUsed: false,
        expiresAt: {
          [Symbol.for('gt')]: new Date() // Not expired
        }
      } 
    });
  }
  
  /**
   * Find active verification by user and type
   */
  async findActiveByUserAndType(
    userId: number, 
    type: VerificationType
  ): Promise<Verification | null> {
    return Verification.findOne({
      where: {
        userId,
        type,
        isUsed: false,
        expiresAt: {
          [Symbol.for('gt')]: new Date() // Not expired
        }
      },
      order: [['createdAt', 'DESC']] // Get the most recent one
    });
  }
  
  /**
   * Mark a verification as used
   */
  async markAsUsed(id: number, transaction?: Transaction): Promise<[number, Verification[]]> {
    return Verification.update({ 
      isUsed: true 
    }, {
      where: { id },
      returning: true,
      transaction
    });
  }
  
  /**
   * Invalidate all active verification tokens for a user and type
   */
  async invalidateAllForUser(
    userId: number, 
    type: VerificationType, 
    transaction?: Transaction
  ): Promise<number> {
    return Verification.update({
      isUsed: true
    }, {
      where: {
        userId,
        type,
        isUsed: false,
        expiresAt: {
          [Symbol.for('gt')]: new Date()
        }
      },
      transaction
    }).then(([count]) => count);
  }
  
  /**
   * Delete expired verification tokens
   */
  async deleteExpired(): Promise<number> {
    return Verification.destroy({
      where: {
        expiresAt: {
          [Symbol.for('lt')]: new Date() // Expired
        }
      }
    });
  }
  
  /**
   * Count recently created tokens for a user and type (for rate limiting)
   */
  async countRecentByUserAndType(
    userId: number,
    type: VerificationType,
    minutes: number = 30
  ): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);
    
    return Verification.count({
      where: {
        userId,
        type,
        createdAt: {
          [Symbol.for('gt')]: cutoffTime
        }
      }
    });
  }
}

export default new VerificationRepository();