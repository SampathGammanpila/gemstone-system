import { body, param, query } from 'express-validator';
import { UserStatus } from '../../types/user.types';

/**
 * Validation rules for updating user profile
 */
export const updateProfileValidator = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim(),
  
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim(),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
];

/**
 * Validation rules for updating user status
 */
export const updateStatusValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  body('status')
    .isIn(Object.values(UserStatus))
    .withMessage('Invalid user status'),
];

/**
 * Validation rules for adding role to user
 */
export const addRoleValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  body('role')
    .isString()
    .withMessage('Role must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .trim(),
];

/**
 * Validation rules for removing role from user
 */
export const removeRoleValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  param('role')
    .isString()
    .withMessage('Role must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .trim(),
];

/**
 * Validation rules for getting user by ID
 */
export const getUserByIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

/**
 * Validation rules for getting users with pagination
 */
export const getUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Validation rules for deleting user
 */
export const deleteUserValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

export default {
  updateProfileValidator,
  updateStatusValidator,
  addRoleValidator,
  removeRoleValidator,
  getUserByIdValidator,
  getUsersValidator,
  deleteUserValidator,
};