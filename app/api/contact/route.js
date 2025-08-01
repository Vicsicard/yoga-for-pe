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
    
    return NextResponse.json(
      { error: 'Failed to send your message. Please try again later.' },
      { status: 500 }
    );
  }
}
