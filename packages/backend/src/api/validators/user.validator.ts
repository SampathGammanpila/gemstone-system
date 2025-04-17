import { body } from 'express-validator';

export const updateProfileValidator = [
  body('first_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  
  body('last_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

export const userValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('first_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  
  body('last_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Active status must be a boolean value'),
  
  body('is_email_verified')
    .optional()
    .isBoolean()
    .withMessage('Email verification status must be a boolean value'),
  
  body('roles')
    .optional()
    .isArray()
    .withMessage('Roles must be an array')
    .custom((roles) => {
      const validRoles = ['customer', 'dealer', 'cutter', 'appraiser', 'admin'];
      return roles.every((role: string) => validRoles.includes(role));
    })
    .withMessage('Roles can only contain: customer, dealer, cutter, appraiser, admin'),
];

export const changeActiveStatusValidator = [
  body('is_active')
    .isBoolean()
    .withMessage('Active status must be a boolean value'),
];