// src/admin/routes/reference-data.routes.ts
import { Router } from 'express';

const router = Router();

// GET /admin/reference-data
router.get('/', (req, res) => {
  res.render('admin/reference-data/gemstone-families', {
    title: 'Reference Data Management',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

// GET /admin/reference-data/gemstone-families
router.get('/gemstone-families', (req, res) => {
  res.render('admin/reference-data/gemstone-families', {
    title: 'Gemstone Families',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

// GET /admin/reference-data/gemstone-family/:id
router.get('/gemstone-family/:id', (req, res) => {
  res.render('admin/reference-data/gemstone-family-form', {
    title: 'Edit Gemstone Family',
    layout: 'layouts/main',
    activeLink: 'reference-data',
    familyId: req.params.id
  });
});

// GET /admin/reference-data/gemstone-family/new
router.get('/gemstone-family/new', (req, res) => {
  res.render('admin/reference-data/gemstone-family-form', {
    title: 'New Gemstone Family',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

// GET /admin/reference-data/cut-shapes
router.get('/cut-shapes', (req, res) => {
  res.render('admin/reference-data/cut-shapes', {
    title: 'Cut Shapes',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

// GET /admin/reference-data/colors
router.get('/colors', (req, res) => {
  res.render('admin/reference-data/colors', {
    title: 'Colors',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

// GET /admin/reference-data/jewelry-types
router.get('/jewelry-types', (req, res) => {
  res.render('admin/reference-data/jewelry-types', {
    title: 'Jewelry Types',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

// GET /admin/reference-data/materials
router.get('/materials', (req, res) => {
  res.render('admin/reference-data/materials', {
    title: 'Materials',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

// GET /admin/reference-data/quality-standards
router.get('/quality-standards', (req, res) => {
  res.render('admin/reference-data/quality-standards', {
    title: 'Quality Standards',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

// GET /admin/reference-data/mining-locations
router.get('/mining-locations', (req, res) => {
  res.render('admin/reference-data/mining-locations', {
    title: 'Mining Locations',
    layout: 'layouts/main',
    activeLink: 'reference-data'
  });
});

export const referenceDataManagementRoutes = router;