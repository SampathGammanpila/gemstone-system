import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize, requirePermission } from '../middlewares/auth.middleware';
import { validateUUID } from '../middlewares/validation.middleware';
import { validate } from '../middlewares/validation.middleware';
import { userValidator, updateProfileValidator } from '../validators/user.validator';
import { auditLog, AuditActions, EntityTypes } from '../middlewares/audit.middleware';
import multer from 'multer';

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = Router();
const userController = new UserController();

// User profile routes
router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

router.put(
  '/profile',
  authenticate,
  validate(updateProfileValidator),
  auditLog(AuditActions.UPDATE, EntityTypes.USER, (req) => req.userId),
  userController.updateProfile
);

router.post(
  '/profile/image',
  authenticate,
  upload.single('image'),
  auditLog(AuditActions.UPLOAD, EntityTypes.USER, (req) => req.userId),
  userController.uploadProfileImage
);

// Admin routes for user management
router.get(
  '/',
  authenticate,
  authorize(['admin']),
  requirePermission(['user:read']),
  userController.getAllUsers
);

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  requirePermission(['user:write']),
  validate(userValidator),
  auditLog(AuditActions.CREATE, EntityTypes.USER, 
    (req) => undefined, 
    (req) => ({ email: req.body.email })
  ),
  userController.createUser
);

router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  requirePermission(['user:read']),
  validateUUID('id'),
  userController.getUserById
);

router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  requirePermission(['user:write']),
  validateUUID('id'),
  validate(userValidator),
  auditLog(AuditActions.UPDATE, EntityTypes.USER, (req) => req.params.id),
  userController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  requirePermission(['user:write']),
  validateUUID('id'),
  auditLog(AuditActions.DELETE, EntityTypes.USER, (req) => req.params.id),
  userController.deleteUser
);

router.patch(
  '/:id/active',
  authenticate,
  authorize(['admin']),
  requirePermission(['user:write']),
  validateUUID('id'),
  auditLog(AuditActions.UPDATE, EntityTypes.USER, 
    (req) => req.params.id,
    (req) => ({ active_status: req.body.is_active })
  ),
  userController.setUserActiveStatus
);

export const userRoutes = router;