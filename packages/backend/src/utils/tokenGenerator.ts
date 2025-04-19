import crypto from 'crypto';
import { VerificationType } from '../types/user.types';

/**
 * Generate a secure random token
 */
export const generateToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a URL-friendly token
 */
export const generateUrlFriendlyToken = (length: number = 32): string => {
  return crypto
    .randomBytes(Math.ceil(length * 3 / 4))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
};

/**
 * Generate a verification token based on type
 */
export const generateVerificationToken = (type: VerificationType): string => {
  switch (type) {
    case VerificationType.EMAIL_VERIFICATION:
      // Shorter, more user-friendly token for email verification
      return generateUrlFriendlyToken(24);
    
    case VerificationType.PASSWORD_RESET:
      // Longer token for password reset for extra security
      return generateToken(32);
    
    case VerificationType.TWO_FACTOR:
      // 6-digit code for 2FA
      return Math.floor(100000 + Math.random() * 900000).toString();
    
    default:
      return generateToken();
  }
};

/**
 * Calculate token expiration time based on type
 */
export const calculateTokenExpiry = (type: VerificationType): Date => {
  const expiry = new Date();
  
  switch (type) {
    case VerificationType.EMAIL_VERIFICATION:
      // Email verification tokens last 3 days
      expiry.setHours(expiry.getHours() + 72);
      break;
    
    case VerificationType.PASSWORD_RESET:
      // Password reset tokens last 1 hour
      expiry.setHours(expiry.getHours() + 1);
      break;
    
    case VerificationType.TWO_FACTOR:
      // 2FA tokens last 10 minutes
      expiry.setMinutes(expiry.getMinutes() + 10);
      break;
    
    default:
      // Default to 24 hours
      expiry.setHours(expiry.getHours() + 24);
  }
  
  return expiry;
};

/**
 * Check if a token has expired
 */
export const isTokenExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

/**
 * Generate a confirmation code (numeric)
 */
export const generateConfirmationCode = (length: number = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Hash a token for storage
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};