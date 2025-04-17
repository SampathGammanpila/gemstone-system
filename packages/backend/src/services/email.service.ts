import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

/**
 * Email Service for sending emails
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // In development, use ethereal.email for testing
    if (config.nodeEnv === 'development' && !process.env.EMAIL_HOST) {
      this.createTestAccount();
    } else {
      this.createProductionTransporter();
    }
  }

  /**
   * Create test email account for development
   */
  private async createTestAccount(): Promise<void> {
    try {
      // Create ethereal.email test account
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      logger.info(`Email testing account created: ${testAccount.user}`);
    } catch (error) {
      logger.error('Failed to create test email account', error);
    }
  }

  /**
   * Create email transporter for production
   */
  private createProductionTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      logger.info('Email transporter created for production');
    } catch (error) {
      logger.error('Failed to create email transporter', error);
    }
  }

  /**
   * Send email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param html - Email body as HTML
   * @param text - Plain text version of email (optional)
   * @returns Promise with send info
   */
  public async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<any> {
    try {
      if (!this.transporter) {
        await this.createTestAccount();
      }
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@gemstone-system.com',
        to,
        subject,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if text not provided
        html
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      
      // Log preview URL in development
      if (config.nodeEnv === 'development') {
        logger.info(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return info;
    } catch (error) {
      logger.error('Failed to send email', error);
      throw error;
    }
  }

  /**
   * Send a welcome email
   * @param to - Recipient email address
   * @param name - Recipient name
   */
  public async sendWelcomeEmail(to: string, name: string): Promise<any> {
    const subject = 'Welcome to the Gemstone System';
    const html = `
      <h1>Welcome to the Gemstone System, ${name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you with us.</p>
      <p>With your account, you can:</p>
      <ul>
        <li>Browse a wide variety of gemstones, rough stones, and jewelry</li>
        <li>Track your favorite items</li>
        <li>Manage your collection</li>
        <li>Participate in our marketplace</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>The Gemstone System Team</p>
    `;
    
    return this.sendEmail(to, subject, html);
  }

  /**
   * Send a certificate email
   * @param to - Recipient email address
   * @param certificateUrl - URL to view the certificate
   * @param gemstoneId - ID of the gemstone
   */
  public async sendCertificateEmail(
    to: string,
    certificateUrl: string,
    gemstoneId: string
  ): Promise<any> {
    const subject = `Certificate for Gemstone ${gemstoneId}`;
    const html = `
      <h1>Your Gemstone Certificate</h1>
      <p>Your certificate for gemstone ${gemstoneId} is now available.</p>
      <p>You can view your certificate by clicking the link below:</p>
      <p><a href="${certificateUrl}">View Certificate</a></p>
      <p>This certificate verifies the authenticity and details of your gemstone.</p>
      <p>Thank you for using our platform.</p>
      <p>Best regards,<br>The Gemstone System Team</p>
    `;
    
    return this.sendEmail(to, subject, html);
  }

  /**
   * Send a transfer notification email
   * @param to - Recipient email address
   * @param transferData - Transfer details
   */
  public async sendTransferNotificationEmail(
    to: string,
    transferData: { itemId: string; itemType: string; from: string; to: string }
  ): Promise<any> {
    const subject = `Transfer Notification: ${transferData.itemType} ${transferData.itemId}`;
    const html = `
      <h1>Ownership Transfer Notification</h1>
      <p>This is to notify you that the ownership of ${transferData.itemType} with ID ${transferData.itemId} has been transferred from ${transferData.from} to ${transferData.to}.</p>
      <p>If you did not authorize this transfer, please contact our support team immediately.</p>
      <p>Best regards,<br>The Gemstone System Team</p>
    `;
    
    return this.sendEmail(to, subject, html);
  }
}