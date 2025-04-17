// src/admin/routes/user.routes.ts
import { Router } from 'express';

const router = Router();

// GET /admin/users
router.get('/', (req, res) => {
  res.render('admin/users/list', {
    title: 'User Management',
    layout: 'layouts/main',
    activeLink: 'users'
  });
});

// GET /admin/users/create
router.get('/create', (req, res) => {
  res.render('admin/users/create', {
    title: 'Create User',
    layout: 'layouts/main',
    activeLink: 'users'
  });
});

// GET /admin/users/:id/edit
router.get('/:id/edit', (req, res) => {
  res.render('admin/users/edit', {
    title: 'Edit User',
    layout: 'layouts/main',
    activeLink: 'users',
    userId: req.params.id
  });
});

// GET /admin/users/:id
router.get('/:id', (req, res) => {
  res.render('admin/users/details', {
    title: 'User Details',
    layout: 'layouts/main',
    activeLink: 'users',
    userId: req.params.id
  });
});

export const userManagementRoutes = router;