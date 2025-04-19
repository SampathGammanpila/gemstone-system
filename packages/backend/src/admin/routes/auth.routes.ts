import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middlewares/admin-validators.middleware';
import { loginValidator, changePasswordValidator, setupMfaValidator, verifyMfaValidator } from '../validators/auth.validator';

const router = Router();

/**
 * @route   GET /admin/auth/login
 * @desc    Show admin login page
 * @access  Public
 */
router.get('/login', authController.showLoginPage);

/**
 * @route   POST /admin/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', validate(loginValidator), authController.login);

/**
 * @route   GET /admin/auth/logout
 * @desc    Admin logout
 * @access  Private
 */
router.get('/logout', authController.logout);

/**
 * @route   GET /admin/auth/change-password
 * @desc    Show change password page
 * @access  Private
 */
router.get('/change-password', authController.showChangePasswordPage);

/**
 * @route   POST /admin/auth/change-password
 * @desc    Change admin password
 * @access  Private
 */
router.post('/change-password', validate(changePasswordValidator), authController.changePassword);

/**
 * @route   GET /admin/auth/setup-mfa
 * @desc    Show MFA setup page
 * @access  Private
 */
router.get('/setup-mfa', authController.showSetupMfaPage);

/**
 * @route   POST /admin/auth/setup-mfa
 * @desc    Setup MFA for admin account
 * @access  Private
 */
router.post('/setup-mfa', validate(setupMfaValidator), authController.setupMfa);

/**
 * @route   GET /admin/auth/verify-mfa
 * @desc    Show MFA verification page
 * @access  Public
 */
router.get('/verify-mfa', authController.showVerifyMfaPage);

/**
 * @route   POST /admin/auth/verify-mfa
 * @desc    Verify MFA code
 * @access  Public
 */
router.post('/verify-mfa', validate(verifyMfaValidator), authController.verifyMfa);

export const adminAuthRoutes = router;
export default router;