import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// API Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;