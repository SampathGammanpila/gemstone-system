import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import dotenv from 'dotenv';

// Import handlebars types directly
type HandlebarsTemplateDelegate = handlebars.TemplateDelegate;

// Load environment variables
dotenv.config();

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

// Template cache
const templateCache: Record<string, HandlebarsTemplateDelegate> = {};

/**
 * Load and compile email template
 */
const loadTemplate = (templateName: string): HandlebarsTemplateDelegate => {
  // Check cache first
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }
  
  // Load template file
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  
  // Compile template
  const template = handlebars.compile(templateSource);
  
  // Store in cache
  templateCache[templateName] = template;
  
  return template;
};

/**
 * Interface for email options
 */
interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  context?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export class EmailService {
  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // If template is provided, render it
      let html = options.html;
      let text = options.text;
      
      if (options.template && options.context) {
        const template = loadTemplate(options.template);
        html = template(options.context);
        
        // Generate plain text version if no text specified
        if (!text && html) {
          // Simple HTML to text conversion - fix the possible undefined error
          text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }
      
      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Gemstone System <noreply@example.com>',
        to: options.to,
        subject: options.subject,
        html,
        text,
        attachments: options.attachments,
      });
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
  
  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to the Gemstone System',
      template: 'welcome',
      context: {
        firstName,
        appName: 'Gemstone System',
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      },
    });
  }
  
  /**
   * Send email verification
   */
  async sendVerificationEmail(to: string, firstName: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    return this.sendEmail({
      to,
      subject: 'Please Verify Your Email',
      template: 'email-verification',
      context: {
        firstName,
        verificationUrl,
        token,
        expires: '72 hours',
      },
    });
  }
  
  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        firstName,
        resetUrl,
        token,
        expires: '1 hour',
      },
    });
  }
  
  /**
   * Send account locked notification
   */
  async sendAccountLockedEmail(to: string, firstName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Account Security Alert',
      template: 'account-locked',
      context: {
        firstName,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
      },
    });
  }
  
  /**
   * Send password changed notification
   */
  async sendPasswordChangedEmail(to: string, firstName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Your Password Has Been Changed',
      template: 'password-changed',
      context: {
        firstName,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
      },
    });
  }
}

export default new EmailService();