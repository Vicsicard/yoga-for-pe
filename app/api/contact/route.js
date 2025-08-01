import { NextResponse } from 'next/server';
import emailService from '../../../lib/services/email';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Handle contact form submissions
 */
export async function POST(request) {
  console.log('Contact form submission received');
  
  // Log SMTP configuration for debugging (without sensitive info)
  console.log('SMTP Configuration:', {
    host: process.env.SMTP_HOST || 'mail.yogaforpe.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    user: process.env.SMTP_USER || 'info@yogaforpe.com',
    hasPassword: !!process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'info@yogaforpe.com',
    contactEmail: process.env.CONTACT_EMAIL || 'hello@yogaforpe.com'
  });
  
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, subject, message, newsletter } = body;
    
    console.log('Contact form data received:', { name, email, subject, messageLength: message?.length, newsletter });
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: Invalid email format', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    console.log('Attempting to send contact form email...');
    
    // Send contact form email with retry logic for serverless environments
    let retryCount = 0;
    const maxRetries = 2; // Maximum number of retries
    let lastError = null;
    
    // Retry loop for handling cold starts and connection issues
    while (retryCount <= maxRetries) {
      try {
        console.log(`SMTP attempt ${retryCount + 1}/${maxRetries + 1}`);
        
        // Add a small delay before retries to allow for connection establishment
        if (retryCount > 0) {
          console.log(`Waiting ${retryCount * 1000}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        }
        
        // Send the contact form email
        await emailService.sendContactFormEmail({
          name,
          email,
          subject,
          message,
          newsletter: !!newsletter
        });
        
        console.log('Contact form email sent successfully');
        
        // If user opted for newsletter, send confirmation
        if (newsletter) {
          try {
            await emailService.sendNewsletterConfirmation({ email });
            console.log('Newsletter confirmation email sent successfully');
          } catch (newsletterError) {
            console.error('Failed to send newsletter confirmation:', newsletterError);
            // Continue with the response even if newsletter email fails
          }
        }
        
        // Success - return response
        return NextResponse.json(
          { message: 'Your message has been sent successfully!' },
          { status: 200 }
        );
      } catch (emailError) {
        // Store the error for potential retry or final error handling
        lastError = emailError;
        console.error(`Email sending failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, emailError.message);
        
        // Only retry on connection-related errors
        if (['ETIMEDOUT', 'ESOCKET', 'ETIMEOUT', 'ECONNREFUSED'].includes(emailError.code)) {
          retryCount++;
          if (retryCount <= maxRetries) {
            console.log(`Retrying due to connection error: ${emailError.code}`);
            continue;
          }
        } else {
          // Don't retry on non-connection errors
          break;
        }
      }
    }
    
    // If we get here, all attempts failed
    console.error('All email sending attempts failed');
    throw lastError; // Re-throw to be caught by outer catch block
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Provide more detailed error information for debugging
    let errorMessage = 'Failed to send your message. Please try again later.';
    let statusCode = 500;
    let errorType = 'unknown';
    
    // Specific error handling based on error codes
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.code === 'ETIMEOUT') {
      errorMessage = 'Email server connection timed out. Please try again later.';
      errorType = 'timeout';
      console.error('SMTP timeout error detected');
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to email server. Please try again later.';
      errorType = 'connection';
      console.error('SMTP connection refused error detected');
    } else if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please contact support.';
      errorType = 'auth';
      console.error('SMTP authentication error detected');
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid email address format detected by mail server.';
      errorType = 'envelope';
      console.error('SMTP envelope error detected');
    } else if (error.responseCode >= 500) {
      errorMessage = 'Mail server error. Please try again later.';
      errorType = 'server';
      console.error('SMTP server error detected');
    }
    
    // Log detailed error information
    console.error('Error details:', {
      type: errorType,
      code: error.code,
      message: error.message,
      command: error.command,
      responseCode: error.responseCode,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace',
      smtpDetails: error.smtpDetails || 'No SMTP details'
    });
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        type: errorType,
        details: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          message: error.message,
          responseCode: error.responseCode
        } : undefined 
      },
      { status: statusCode }
    );
  }
}
