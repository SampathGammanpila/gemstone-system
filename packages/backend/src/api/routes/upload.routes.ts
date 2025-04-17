import { Router } from 'express';

const router = Router();

// POST /api/upload
router.post('/', (req, res) => {
  res.json({ message: 'Upload routes are not implemented yet' });
});

export { router as uploadRoutes };