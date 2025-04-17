import { Router } from 'express';

const router = Router();

// GET /api/rough-stones
router.get('/', (req, res) => {
  res.json({ message: 'Rough stone routes are not implemented yet' });
});

export { router as roughStoneRoutes };