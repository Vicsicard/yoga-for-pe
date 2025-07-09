// API route to check if a user has access to a specific subscription tier
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { hasAccess: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return NextResponse.json(
        { hasAccess: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const userId = decoded.userId;
    
    // Get video tier from query params
    const searchParams = request.nextUrl.searchParams;
    const videoTierParam = searchParams.get('videoTier');
    
    if (!videoTierParam) {
      return NextResponse.json(
        { hasAccess: false, error: 'Missing videoTier parameter' },
        { status: 400 }
      );
    }
    
    // Parse tier from string to enum
    let videoTier: SubscriptionTier;
    try {
      videoTier = parseInt(videoTierParam, 10) as SubscriptionTier;
      
      // Validate the tier is a valid enum value
      if (![SubscriptionTier.BRONZE, SubscriptionTier.SILVER, SubscriptionTier.GOLD].includes(videoTier)) {
        throw new Error('Invalid tier value');
      }
    } catch (error) {
      return NextResponse.json(
        { hasAccess: false, error: 'Invalid videoTier parameter' },
        { status: 400 }
      );
    }
    
    // For now, provide basic access logic
    // TODO: Implement proper subscription service integration with user database
    let hasAccess = false;
    
    // Basic access logic - authenticated users get Bronze access by default
    // TODO: Fetch user subscription status from database using userId
    switch (videoTier) {
      case SubscriptionTier.BRONZE:
        // All authenticated users can access Bronze (free) content
        hasAccess = true;
        break;
      case SubscriptionTier.SILVER:
      case SubscriptionTier.GOLD:
        // Premium tiers require subscription - placeholder logic
        // TODO: Check user's actual subscription status from database
        hasAccess = false;
        break;
      default:
        hasAccess = false;
    }
    
    return NextResponse.json({ hasAccess });
  } catch (error: any) {
    console.error('Error checking subscription access:', error);
    return NextResponse.json(
      { 
        hasAccess: false, 
        error: 'Failed to check subscription access',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
