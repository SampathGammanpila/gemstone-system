import { Router } from 'express';

const router = Router();

// GET /api/professionals
router.get('/', (req, res) => {
  res.json({ message: 'Professional routes are not implemented yet' });
});

export { router as professionalRoutes };