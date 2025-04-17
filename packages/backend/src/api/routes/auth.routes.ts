// src/api/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { 
  registerValidator, 
  loginValidator, 
  forgotPasswordValidator, 
  resetPasswordValidator,
  changePasswordValidator
} from '../validators/auth.validator';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { validateCsrfToken } from '../middlewares/csrf.middleware';
import { auditLog, AuditActions, EntityTypes } from '../middlewares/audit.middleware';

const router = Router();
const authController = new AuthController();

// CSRF token endpoint
router.get('/csrf-token', authController.getCsrfToken);

// Public routes
router.post(
  '/register',
  validate(registerValidator),
  auditLog(AuditActions.REGISTER, EntityTypes.USER, 
    (req) => undefined,
    (req) => ({ email: req.body.email })
  ),
  authController.register
);

router.post(
  '/login',
  validate(loginValidator),
  auditLog(AuditActions.LOGIN, EntityTypes.USER, 
    (req) => undefined,
    (req) => ({ email: req.body.email })
  ),
  authController.login
);

router.get(
  '/verify-email/:token',
  auditLog(AuditActions.VERIFY, EntityTypes.USER, 
    (req) => undefined,
    (req) => ({ token: req.params.token })
  ),
  authController.verifyEmail
);

router.post(
  '/forgot-password',
  validate(forgotPasswordValidator),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate(resetPasswordValidator),
  authController.resetPassword
);

router.post(
  '/refresh-token',
  authController.refreshToken
);

// Protected routes
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordValidator),
  auditLog(AuditActions.UPDATE, EntityTypes.USER,
    (req) => req.userId
  ),
  authController.changePassword
);

router.post(
  '/logout',
  authenticate,
  auditLog(AuditActions.LOGOUT, EntityTypes.USER,
    (req) => req.userId
  ),
  authController.logout
);

export const authRoutes = router;