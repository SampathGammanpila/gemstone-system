import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import userValidator from '../validators/user.validator';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get authenticated user's profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  userController.getUserProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update authenticated user's profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validate(userValidator.updateProfileValidator),
  userController.updateUserProfile
);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  isAdmin,
  validate(userValidator.getUsersValidator),
  userController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  authenticate,
  isAdmin,
  validate(userValidator.getUserByIdValidator),
  userController.getUserById
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Update user status (admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/status',
  authenticate,
  isAdmin,
  validate(userValidator.updateStatusValidator),
  userController.updateUserStatus
);

/**
 * @route   POST /api/users/:id/roles
 * @desc    Add role to user (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/:id/roles',
  authenticate,
  isAdmin,
  validate(userValidator.addRoleValidator),
  userController.addUserRole
);

/**
 * @route   DELETE /api/users/:id/roles/:role
 * @desc    Remove role from user (admin only)
 * @access  Private (Admin)
 */
router.delete(
  '/:id/roles/:role',
  authenticate,
  isAdmin,
  validate(userValidator.removeRoleValidator),
  userController.removeUserRole
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate(userValidator.deleteUserValidator),
  userController.deleteUser
);

export default router;