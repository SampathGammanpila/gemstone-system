import { Request, Response } from 'express';
import adminService from '../../services/admin.service';
import { comparePassword, hashPassword } from '../../utils/encryption';
import { generateToken } from '../../utils/tokenGenerator';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class AuthController {
  /**
   * Show admin login page
   */
  async showLoginPage(req: Request, res: Response): Promise<void> {
    // Check if already logged in
    if (req.session && req.session.adminUser) {
      res.redirect('/admin/dashboard');
      return;
    }
    
    // Render login page
    res.render('auth/login', {
      title: 'Admin Login',
      error: req.flash('error'),
      success: req.flash('success'),
    });
  }

  /**
   * Handle admin login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Find admin user
      const adminUser = await adminService.findAdminByEmail(email);
      
      if (!adminUser) {
        req.flash('error', 'Invalid email or password');
        res.redirect('/admin/auth/login');
        return;
      }
      
      // Verify password
      const isPasswordValid = await comparePassword(password, adminUser.password);
      
      if (!isPasswordValid) {
        req.flash('error', 'Invalid email or password');
        res.redirect('/admin/auth/login');
        return;
      }
      
      // Check if MFA is enabled
      if (adminUser.mfaEnabled) {
        // Store user info in session for MFA verification
        (req.session as any).pendingMfaUser = {
          id: adminUser.id,
          email: adminUser.email,
        };
        
        res.redirect('/admin/auth/verify-mfa');
        return;
      }
      
      // Create admin session
      req.session.adminUser = {
        id: adminUser.id,
        email: adminUser.email,
        name: `${adminUser.firstName} ${adminUser.lastName}`, // Combined name for the session
        role: 'admin',
      };
      
      // Update last login
      await adminService.updateLastLogin(adminUser.id);
      
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'An error occurred during login');
      res.redirect('/admin/auth/login');
    }
  }

  /**
   * Handle admin logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    // Clear admin session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/admin/auth/login');
    });
  }

  /**
   * Show change password page
   */
  async showChangePasswordPage(req: Request, res: Response): Promise<void> {
    if (!req.session || !req.session.adminUser) {
      res.redirect('/admin/auth/login');
      return;
    }
    
    res.render('auth/change-password', {
      title: 'Change Password',
      error: req.flash('error'),
      success: req.flash('success'),
    });
  }

  /**
   * Handle change password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.session || !req.session.adminUser) {
        res.redirect('/admin/auth/login');
        return;
      }
      
      const { currentPassword, newPassword } = req.body;
      const adminId = req.session.adminUser.id;
      
      // Find admin user
      const adminUser = await adminService.findAdminById(adminId);
      
      if (!adminUser) {
        req.flash('error', 'Admin user not found');
        res.redirect('/admin/auth/change-password');
        return;
      }
      
      // Verify current password
      const isPasswordValid = await comparePassword(currentPassword, adminUser.password);
      
      if (!isPasswordValid) {
        req.flash('error', 'Current password is incorrect');
        res.redirect('/admin/auth/change-password');
        return;
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await adminService.updatePassword(adminId, hashedPassword);
      
      req.flash('success', 'Password changed successfully');
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Change password error:', error);
      req.flash('error', 'An error occurred while changing password');
      res.redirect('/admin/auth/change-password');
    }
  }

  /**
   * Show MFA setup page
   */
  async showSetupMfaPage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.session || !req.session.adminUser) {
        res.redirect('/admin/auth/login');
        return;
      }
      
      const adminId = req.session.adminUser.id;
      
      // Generate a secret
      const secret = speakeasy.generateSecret({
        name: `Gemstone Admin Portal:${req.session.adminUser.email}`,
      });
      
      // Store temporary secret in session
      (req.session as any).tempMfaSecret = secret.base32;
      
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');
      
      res.render('auth/setup-mfa', {
        title: 'Setup MFA',
        qrCodeUrl,
        secret: secret.base32,
        error: req.flash('error'),
        success: req.flash('success'),
      });
    } catch (error) {
      console.error('MFA setup error:', error);
      req.flash('error', 'An error occurred while setting up MFA');
      res.redirect('/admin/auth/change-password');
    }
  }

  /**
   * Handle MFA setup
   */
  async setupMfa(req: Request, res: Response): Promise<void> {
    try {
      if (!req.session || !req.session.adminUser || !(req.session as any).tempMfaSecret) {
        res.redirect('/admin/auth/login');
        return;
      }
      
      const { token } = req.body;
      const adminId = req.session.adminUser.id;
      const secret = (req.session as any).tempMfaSecret;
      
      // Verify token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
      });
      
      if (!verified) {
        req.flash('error', 'Invalid verification code');
        res.redirect('/admin/auth/setup-mfa');
        return;
      }
      
      // Enable MFA for admin
      await adminService.enableMfa(adminId, secret);
      
      // Clean up session
      delete (req.session as any).tempMfaSecret;
      
      req.flash('success', 'MFA enabled successfully');
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('MFA setup error:', error);
      req.flash('error', 'An error occurred while setting up MFA');
      res.redirect('/admin/auth/setup-mfa');
    }
  }

  /**
   * Show MFA verification page
   */
  async showVerifyMfaPage(req: Request, res: Response): Promise<void> {
    if (!req.session || !(req.session as any).pendingMfaUser) {
      res.redirect('/admin/auth/login');
      return;
    }
    
    res.render('auth/verify-mfa', {
      title: 'Verify MFA',
      error: req.flash('error'),
    });
  }

  /**
   * Handle MFA verification
   */
  async verifyMfa(req: Request, res: Response): Promise<void> {
    try {
      if (!req.session || !(req.session as any).pendingMfaUser) {
        res.redirect('/admin/auth/login');
        return;
      }
      
      const { token } = req.body;
      const adminId = (req.session as any).pendingMfaUser.id;
      
      // Find admin user
      const adminUser = await adminService.findAdminById(adminId);
      
      if (!adminUser || !adminUser.mfaSecret) {
        req.flash('error', 'Admin user not found');
        res.redirect('/admin/auth/login');
        return;
      }
      
      // Verify token
      const verified = speakeasy.totp.verify({
        secret: adminUser.mfaSecret,
        encoding: 'base32',
        token,
      });
      
      if (!verified) {
        req.flash('error', 'Invalid verification code');
        res.redirect('/admin/auth/verify-mfa');
        return;
      }
      
      // Create admin session
      req.session.adminUser = {
        id: adminUser.id,
        email: adminUser.email,
        name: `${adminUser.firstName} ${adminUser.lastName}`,
        role: 'admin',
      };
      
      // Clean up pending MFA user
      delete (req.session as any).pendingMfaUser;
      
      // Update last login
      await adminService.updateLastLogin(adminUser.id);
      
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('MFA verification error:', error);
      req.flash('error', 'An error occurred while verifying MFA');
      res.redirect('/admin/auth/verify-mfa');
    }
  }
}

export default new AuthController();