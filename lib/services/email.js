// Force Node.js runtime for this module
export const runtime = 'nodejs';

// Explicitly prevent this module from being imported on the client side
if (typeof window !== 'undefined') {
  throw new Error('This module is server-side only and cannot be used on the client');
}

const nodemailer = require('nodemailer');

/**
 * Email service for sending transactional emails
 */
class EmailService {
  constructor() {
    // Log SMTP configuration (without password) for debugging
    console.log('Initializing email service with config:', {
      host: process.env.SMTP_HOST || 'mail.yogaforpe.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || 'info@yogaforpe.com',
      passwordProvided: !!process.env.SMTP_PASSWORD
    });
    
    // Create reusable transporter with Bluehost SMTP settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.yogaforpe.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'info@yogaforpe.com', // default to info@ email
        pass: process.env.SMTP_PASSWORD,
      },
      // Add connection timeout settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,   // 5 seconds
      socketTimeout: 10000,    // 10 seconds
    });
    
    // Verify connection configuration
    this.verifyConnection();
  }
  
  /**
   * Verify SMTP connection configuration
   * @returns {Promise<boolean>} - True if connection is verified
   */
  async verifyConnection() {
    try {
      if (!process.env.SMTP_PASSWORD) {
        console.warn('SMTP_PASSWORD environment variable is not set. Email sending will fail.');
        return false;
      }
      
      // Only verify in development to avoid startup delays in production
      if (process.env.NODE_ENV === 'development') {
        const verified = await this.transporter.verify();
        console.log('SMTP connection verified:', verified);
        return verified;
      }
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error.message);
      return false;
    }
  }

  /**
   * Send a welcome email to a new user with their credentials
   * @param {Object} options
   * @param {string} options.name - User's name
   * @param {string} options.email - User's email
   * @param {string} options.password - User's password (only for manually created accounts)
   * @returns {Promise<Object>} - Nodemailer send result
   */
  async sendWelcomeEmail({ name, email, password = null }) {
    try {
      console.log(`Sending welcome email to ${email}`);
      
      const subject = 'Welcome to Yoga for PE!';
      
      // Create email content based on whether password is provided
      let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #167A8C;">Welcome to Yoga for PE!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for creating an account with Yoga for PE. We're excited to have you join our community of educators bringing yoga into physical education programs.</p>
      `;
      
      // Only include password information if it was provided
      if (password) {
        html += `
          <div style="background-color: #f7f7f7; padding: 15px; border-left: 4px solid #167A8C; margin: 20px 0;">
            <p><strong>Your account information:</strong></p>
            <p>Email: ${email}</p>
            <p>Password: ${password}</p>
            <p><em>We recommend changing your password after your first login.</em></p>
          </div>
        `;
      }
      
      html += `
          <p>You now have access to our Bronze tier content. To access premium content, please visit our <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://yogaforpe.com'}/subscription/plans" style="color: #167A8C; text-decoration: underline;">subscription plans</a>.</p>
          <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:info@yogaforpe.com" style="color: #167A8C;">info@yogaforpe.com</a>.</p>
          <p>Best regards,<br>The Yoga for PE Team</p>
        </div>
      `;
      
      // Send email
      const info = await this.transporter.sendMail({
        from: `"Yoga for PE" <${process.env.SMTP_FROM || 'info@yogaforpe.com'}>`,
        to: email,
        subject,
        html,
      });
      
      console.log(`Welcome email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send a password reset email with a reset link
   * @param {Object} options
   * @param {string} options.email - User's email
   * @param {string} options.resetUrl - Password reset URL with token
   * @returns {Promise<Object>} - Nodemailer send result
   */
  async sendPasswordResetEmail({ email, resetUrl }) {
    try {
      console.log(`Sending password reset email to ${email}`);
      
      const subject = 'Reset Your Yoga for PE Password';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #167A8C;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your Yoga for PE account. To reset your password, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #167A8C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>Best regards,<br>The Yoga for PE Team</p>
        </div>
      `;
      
      // Send email
      const info = await this.transporter.sendMail({
        from: `"Yoga for PE" <${process.env.SMTP_FROM || 'info@yogaforpe.com'}>`,
        to: email,
        subject,
        html,
      });
      
      console.log(`Password reset email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send a contact form submission notification
   * @param {Object} options
   * @param {string} options.name - Sender's name
   * @param {string} options.email - Sender's email
   * @param {string} options.subject - Email subject
   * @param {string} options.message - Email message
   * @param {boolean} options.newsletter - Whether the user wants to subscribe to the newsletter
   * @returns {Promise<Object>} - Nodemailer send result
   */
  async sendContactFormEmail({ name, email, subject, message, newsletter = false }) {
    try {
      console.log(`Sending contact form email from ${email}`);
      
      const emailSubject = `Contact Form: ${subject}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #167A8C;">New Contact Form Submission</h2>
          
          <div style="background-color: #f7f7f7; padding: 15px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Newsletter Signup:</strong> ${newsletter ? 'Yes' : 'No'}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>This message was sent from the Yoga for PE website contact form.</p>
        </div>
      `;
      
      // Send email to site admin
      const info = await this.transporter.sendMail({
        from: `"Yoga for PE Website" <${process.env.SMTP_FROM || 'info@yogaforpe.com'}>`,
        to: process.env.CONTACT_EMAIL || 'hello@yogaforpe.com',
        replyTo: email,
        subject: emailSubject,
        html,
      });
      
      console.log(`Contact form email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending contact form email:', {
        code: error.code,
        message: error.message,
        responseCode: error.responseCode,
        command: error.command
      });
      
      // Add more context to the error
      const enhancedError = new Error(`Failed to send contact form email: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.smtpDetails = {
        host: process.env.SMTP_HOST || 'mail.yogaforpe.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || 'info@yogaforpe.com',
        hasPassword: !!process.env.SMTP_PASSWORD
      };
      throw enhancedError;
    }
  }

  /**
   * Send a newsletter signup confirmation
   * @param {Object} options
   * @param {string} options.email - Subscriber's email
   * @returns {Promise<Object>} - Nodemailer send result
   */
  async sendNewsletterConfirmation({ email }) {
    try {
      console.log(`Sending newsletter confirmation to ${email}`);
      
      const subject = 'Welcome to the Yoga for PE Newsletter';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #167A8C;">Thanks for Subscribing!</h2>
          <p>Hello,</p>
          <p>Thank you for subscribing to the Yoga for PE newsletter. You'll now receive updates about:</p>
          
          <ul style="padding-left: 20px;">
            <li>New yoga content for physical education</li>
            <li>Teaching tips and resources</li>
            <li>Upcoming workshops and events</li>
            <li>Special offers for subscribers</li>
          </ul>
          
          <p>We're excited to have you join our community of educators bringing yoga into physical education programs.</p>
          <p>Best regards,<br>The Yoga for PE Team</p>
        </div>
      `;
      
      // Send email
      const info = await this.transporter.sendMail({
        from: `"Yoga for PE" <${process.env.SMTP_FROM || 'info@yogaforpe.com'}>`,
        to: email,
        subject,
        html,
      });
      
      console.log(`Newsletter confirmation email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending newsletter confirmation:', error);
      throw error;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;
