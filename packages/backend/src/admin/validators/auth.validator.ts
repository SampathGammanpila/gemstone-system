import { body } from 'express-validator';
import { isStrongPassword } from '../../utils/validators';

/**
 * Validation rules for admin login
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
 * Validation rules for changing admin password
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
 * Validation rules for MFA setup
 */
export const setupMfaValidator = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must contain only numbers')
];

/**
 * Validation rules for MFA verification
 */
export const verifyMfaValidator = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must contain only numbers')
];

export default {
  loginValidator,
  changePasswordValidator,
  setupMfaValidator,
  verifyMfaValidator
};