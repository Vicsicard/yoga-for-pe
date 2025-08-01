import { NextResponse } from 'next/server';
import emailService from '../../../lib/services/email';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Handle contact form submissions
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, subject, message, newsletter } = body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Send contact form email
    await emailService.sendContactFormEmail({
      name,
      email,
      subject,
      message,
      newsletter: !!newsletter
    });
    
    // If user opted for newsletter, send confirmation
    if (newsletter) {
      try {
        await emailService.sendNewsletterConfirmation({ email });
      } catch (newsletterError) {
        console.error('Failed to send newsletter confirmation:', newsletterError);
        // Continue with the response even if newsletter email fails
      }
    }
    
    return NextResponse.json(
      { message: 'Your message has been sent successfully!' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Provide more detailed error information for debugging
    const errorMessage = error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.code === 'ECONNREFUSED'
      ? 'Email server connection timed out. Please check SMTP settings.'
      : 'Failed to send your message. Please try again later.';
    
    // Log additional details for server-side debugging
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack?.split('\n')[0] || 'No stack trace',
      smtpResponse: error.response || 'No SMTP response'
    });
    
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
