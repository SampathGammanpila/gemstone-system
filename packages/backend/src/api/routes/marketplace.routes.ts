import { Router } from 'express';

const router = Router();

// GET /api/marketplace
router.get('/', (req, res) => {
  res.json({ message: 'Marketplace routes are not implemented yet' });
});

export { router as marketplaceRoutes };