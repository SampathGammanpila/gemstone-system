import { Router } from 'express';

const router = Router();

// GET /api/gemstones
router.get('/', (req, res) => {
  res.json({ message: 'Gemstone routes are not implemented yet' });
});

export { router as gemstoneRoutes };