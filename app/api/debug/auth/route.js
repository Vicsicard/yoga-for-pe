import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../../lib/db/connect';
import User from '../../../../lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    const hasAuthHeader = !!authHeader;
    const authHeaderFormat = hasAuthHeader ? (authHeader.startsWith('Bearer ') ? 'valid' : 'invalid') : 'missing';
    
    // JWT Secret check
    const jwtSecretExists = !!process.env.JWT_SECRET;
    const jwtSecretLength = jwtSecretExists ? process.env.JWT_SECRET.length : 0;
    
    // Token validation
    let tokenValidation = { valid: false, error: 'No token provided' };
    let userData = null;
    
    if (hasAuthHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Attempt to decode without verification first to see token structure
        const decodedWithoutVerify = jwt.decode(token);
        
        // Now try to verify with the secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        tokenValidation = { valid: true, decoded };
        
        // Try to find the user
        try {
          await connectDB();
          const user = await User.findById(decoded.userId);
          if (user) {
            userData = {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              hasSubscription: !!user.subscription,
              subscriptionDetails: user.subscription || null
            };
          } else {
            userData = { error: 'User not found in database' };
          }
        } catch (dbError) {
          userData = { error: `Database error: ${dbError.message}` };
        }
      } catch (jwtError) {
        tokenValidation = { 
          valid: false, 
          error: jwtError.message,
          name: jwtError.name
        };
      }
    }
    
    return NextResponse.json({
      auth: {
        hasAuthHeader,
        authHeaderFormat,
        jwtSecretExists,
        jwtSecretLength,
        tokenValidation
      },
      user: userData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to debug authentication',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
