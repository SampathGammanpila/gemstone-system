import { Router } from 'express';

const router = Router();

// GET /api/reference-data
router.get('/', (req, res) => {
  res.json({ message: 'Reference data routes are not implemented yet' });
});

export { router as referenceDataRoutes };