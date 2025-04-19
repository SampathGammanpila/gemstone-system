// src/admin/routes/professional.routes.ts
import { Router } from 'express';

const router = Router();

// GET /admin/professionals
router.get('/', (req, res) => {
  res.render('professionals/list', {
    title: 'Professional Management',
    layout: 'layouts/main',
    activeLink: 'professionals'
  });
});

// GET /admin/professionals/pending
router.get('/pending', (req, res) => {
  res.render('professionals/pending', {
    title: 'Pending Professionals',
    layout: 'layouts/main',
    activeLink: 'professionals'
  });
});

// GET /admin/professionals/:id
router.get('/:id', (req, res) => {
  res.render('professionals/details', {
    title: 'Professional Details',
    layout: 'layouts/main',
    activeLink: 'professionals',
    professionalId: req.params.id
  });
});

// GET /admin/professionals/:id/documents
router.get('/:id/documents', (req, res) => {
  res.render('professionals/documents', {
    title: 'Professional Documents',
    layout: 'layouts/main',
    activeLink: 'professionals',
    professionalId: req.params.id
  });
});

export const professionalManagementRoutes = router;
export default router;