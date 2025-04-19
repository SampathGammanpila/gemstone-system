import { Request, Response, NextFunction } from 'express';
import adminService from '../../services/admin.service';

/**
 * Middleware to check if user is authenticated as admin
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if admin user exists in session
    if (!req.session || !req.session.adminUser) {
      // Store original URL for redirect after login
      req.session.returnTo = req.originalUrl;
      
      // Redirect to login page
      res.redirect('/admin/auth/login');
      return;
    }
    
    // Check if admin user exists in database
    const adminId = req.session.adminUser.id;
    const adminUser = await adminService.findAdminById(adminId);
    
    if (!adminUser) {
      // Invalid admin user, clear session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.redirect('/admin/auth/login');
      });
      return;
    }
    
    // Admin is authenticated, continue
    // Make admin user data available to templates
    res.locals.adminUser = req.session.adminUser;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
};

/**
 * Middleware to redirect authenticated admins away from public pages (like login)
 */
export const redirectIfAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session && req.session.adminUser) {
    res.redirect('/admin/dashboard');
    return;
  }
  
  next();
};

export default {
  authenticate,
  redirectIfAuthenticated,
};