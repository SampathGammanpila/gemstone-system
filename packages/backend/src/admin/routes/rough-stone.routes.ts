// src/admin/routes/rough-stone.routes.ts
import { Router } from 'express';

const router = Router();

// GET /admin/rough-stones
router.get('/', (req, res) => {
  res.render('admin/rough-stones/list', {
    title: 'Rough Stone Management',
    layout: 'layouts/main',
    activeLink: 'rough-stones'
  });
});

// GET /admin/rough-stones/approval
router.get('/approval', (req, res) => {
  res.render('admin/rough-stones/approval', {
    title: 'Rough Stone Approval',
    layout: 'layouts/main',
    activeLink: 'rough-stones'
  });
});

// GET /admin/rough-stones/:id
router.get('/:id', (req, res) => {
  res.render('admin/rough-stones/details', {
    title: 'Rough Stone Details',
    layout: 'layouts/main',
    activeLink: 'rough-stones',
    roughStoneId: req.params.id
  });
});

export const roughStoneManagementRoutes = router;