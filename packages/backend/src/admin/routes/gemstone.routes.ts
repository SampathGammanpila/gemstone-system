// src/admin/routes/gemstone.routes.ts
import { Router } from 'express';

const router = Router();

// GET /admin/gemstones
router.get('/', (req, res) => {
  res.render('admin/gemstones/list', {
    title: 'Gemstone Management',
    layout: 'layouts/main',
    activeLink: 'gemstones'
  });
});

// GET /admin/gemstones/approval
router.get('/approval', (req, res) => {
  res.render('admin/gemstones/approval', {
    title: 'Gemstone Approval',
    layout: 'layouts/main',
    activeLink: 'gemstones'
  });
});

// GET /admin/gemstones/:id
router.get('/:id', (req, res) => {
  res.render('admin/gemstones/details', {
    title: 'Gemstone Details',
    layout: 'layouts/main',
    activeLink: 'gemstones',
    gemstoneId: req.params.id
  });
});

export const gemstoneManagementRoutes = router;