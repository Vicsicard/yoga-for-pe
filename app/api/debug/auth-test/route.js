import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db/index';
import User from '../../../../lib/models/User';
import { generateToken, verifyToken } from '../../../../auth';

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    console.log('Starting authentication system test...');
    const results = {
      database: { status: 'pending' },
      auth: { status: 'pending' },
      subscription: { status: 'pending' },
      overall: 'pending'
    };

    // Test database connection
    try {
      await connectDB();
      results.database.status = 'success';
      results.database.message = 'Database connected successfully';
      
      // Count users
      const userCount = await User.countDocuments();
      results.database.userCount = userCount;
      
      if (userCount > 0) {
        // Find a test user
        const testUser = await User.findOne({});
        
        if (testUser) {
          results.database.testUser = {
            id: testUser._id.toString(),
            email: testUser.email,
            name: testUser.name,
            hasSubscription: !!testUser.subscription
          };
          
          // Test JWT token generation and verification
          try {
            const token = generateToken(testUser);
            results.auth.token = token.substring(0, 20) + '...'; // Only show part of the token
            
            const decoded = verifyToken(token);
            results.auth.decoded = decoded;
            results.auth.status = 'success';
            results.auth.message = 'JWT token generated and verified successfully';
            
            // Test subscription data
            if (testUser.subscription) {
              results.subscription.status = 'success';
              results.subscription.data = {
                status: testUser.subscription.status,
                plan: testUser.subscription.plan,
                hasStripeId: !!testUser.subscription.stripeCustomerId
              };
            } else {
              results.subscription.status = 'warning';
              results.subscription.message = 'User has no subscription data';
            }
          } catch (authError) {
            results.auth.status = 'error';
            results.auth.message = `JWT error: ${authError.message}`;
          }
        } else {
          results.database.status = 'warning';
          results.database.message = 'No test user found';
        }
      } else {
        results.database.status = 'warning';
        results.database.message = 'No users found in database';
      }
    } catch (dbError) {
      results.database.status = 'error';
      results.database.message = `Database error: ${dbError.message}`;
    }
    
    // Calculate overall status
    if (results.database.status === 'error' || results.auth.status === 'error') {
      results.overall = 'error';
    } else if (results.database.status === 'warning' || results.auth.status === 'warning') {
      results.overall = 'warning';
    } else {
      results.overall = 'success';
    }
    
    return NextResponse.json({
      message: 'Authentication system test completed',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Auth test failed', message: error.message },
      { status: 500 }
    );
  }
}
