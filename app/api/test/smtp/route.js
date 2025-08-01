import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Test SMTP connection and return detailed diagnostics
 * This endpoint should only be accessible in development mode
 */
export async function GET(request) {
  // Security check - only allow in development mode or with admin authentication
  const isDevMode = process.env.NODE_ENV === 'development';
  
  if (!isDevMode) {
    // In production, require admin authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required for SMTP testing in production' },
        { status: 401 }
      );
    }
    
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Only allow admins to access this endpoint in production
      if (!decoded.role || decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin privileges required for SMTP testing in production' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token', details: error.message },
        { status: 401 }
      );
    }
  }

  console.log('SMTP test requested');
  
  // Get configuration from environment variables
  const config = {
    host: process.env.SMTP_HOST || 'mail.yogaforpe.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    user: process.env.SMTP_USER || 'info@yogaforpe.com',
    hasPassword: !!process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'info@yogaforpe.com',
    contactEmail: process.env.CONTACT_EMAIL || 'hello@yogaforpe.com'
  };
  
  // Create a test transporter
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: process.env.SMTP_USER || 'info@yogaforpe.com',
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 30000,     // 30 seconds
    debug: true,
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });
  
  try {
    console.log('Testing SMTP connection...');
    
    // Test the connection
    const verifyResult = await transporter.verify();
    console.log('SMTP connection verified:', verifyResult);
    
    // Try to send a test email
    let sendResult = null;
    let sendError = null;
    
    try {
      sendResult = await transporter.sendMail({
        from: `"SMTP Test" <${config.from}>`,
        to: config.contactEmail,
        subject: 'SMTP Test Email',
        text: 'This is a test email to verify SMTP functionality.',
        html: '<p>This is a test email to verify SMTP functionality.</p>'
      });
      console.log('Test email sent:', sendResult.messageId);
    } catch (error) {
      console.error('Failed to send test email:', error);
      sendError = {
        code: error.code,
        message: error.message,
        responseCode: error.responseCode,
        command: error.command
      };
    }
    
    // Return success with diagnostic information
    return NextResponse.json({
      success: true,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        hasPassword: config.hasPassword,
        from: config.from,
        contactEmail: config.contactEmail
      },
      connection: {
        verified: verifyResult,
        sendSuccess: !!sendResult,
        messageId: sendResult?.messageId,
        sendError
      }
    });
    
  } catch (error) {
    console.error('SMTP test failed:', error);
    
    // Return detailed error information
    return NextResponse.json({
      success: false,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        hasPassword: config.hasPassword,
        from: config.from,
        contactEmail: config.contactEmail
      },
      error: {
        code: error.code,
        message: error.message,
        responseCode: error.responseCode,
        command: error.command,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      }
    });
  }
}
