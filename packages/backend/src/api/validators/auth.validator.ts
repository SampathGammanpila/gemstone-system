import { body, param } from 'express-validator';
import { isStrongPassword } from '../../utils/validators';
import userRepository from '../../db/repositories/user.repository';

/**
 * Validation rules for user registration
 */
export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('Email is already registered');
      }
      return true;
    }),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((password) => {
      if (!isStrongPassword(password)) {
        throw new Error('Password must contain uppercase, lowercase, and numeric characters');
      }
      return true;
    }),
  
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim(),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim(),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

/**
 * Validation rules for user login
 */
export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for refresh token
 */
export const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid refresh token format'),
];

/**
 * Validation rules for email verification
 */
export const verifyEmailValidator = [
  param('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid token format'),
];

/**
 * Validation rules for password reset request
 */
export const requestPasswordResetValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

/**
 * Validation rules for password reset
 */
export const resetPasswordValidator = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid token format'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((password) => {
      if (!isStrongPassword(password)) {
        throw new Error('Password must contain uppercase, lowercase, and numeric characters');
      }
      return true;
    }),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * Validation rules for password change
 */
export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .custom((password) => {
      if (!isStrongPassword(password)) {
        throw new Error('Password must contain uppercase, lowercase, and numeric characters');
      }
      return true;
    })
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * Validation rules for resend verification email
 */
export const resendVerificationEmailValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

export default {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  verifyEmailValidator,
  requestPasswordResetValidator,
  resetPasswordValidator,
  changePasswordValidator,
  resendVerificationEmailValidator,
};