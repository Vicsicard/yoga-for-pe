import { NextResponse } from 'next/server';
import User from '../../../../lib/models/User';
import { connectDB } from '../../../../lib/db/index';
import { verifyToken } from '../../../../auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication token is missing',
        errorCode: 'TOKEN_MISSING'
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    let decoded;
    try {
      // Use enhanced verifyToken function from auth.js
      decoded = verifyToken(token);
    } catch (tokenError) {
      // Handle specific token verification errors
      const errorCode = tokenError.message;
      const statusCode = getStatusCodeFromError(errorCode);
      const errorMessage = getErrorMessage(errorCode);
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        errorCode: errorCode
      }, { status: statusCode });
    }
    
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Unable to connect to the database',
        errorCode: 'DATABASE_CONNECTION_ERROR'
      }, { status: 500 });
    }
    
    // Find user
    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'User account no longer exists',
          errorCode: 'USER_NOT_FOUND'
        }, { status: 404 });
      }
      
      // Return user data
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      };
      
      return NextResponse.json({
        success: true,
        user: userData
      }, { status: 200 });
    } catch (userError) {
      console.error('User retrieval error:', userError);
      return NextResponse.json({
        success: false,
        message: 'Error retrieving user data',
        errorCode: 'USER_RETRIEVAL_ERROR'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Session error:', error);
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to determine appropriate HTTP status code based on error
function getStatusCodeFromError(errorCode) {
  switch (errorCode) {
    case 'USER_NOT_FOUND':
    case 'USER_RETRIEVAL_ERROR':
      return 404; // Not found
    case 'INVALID_PASSWORD':
    case 'INVALID_CREDENTIALS':
    case 'MISSING_CREDENTIALS':
    case 'TOKEN_INVALID':
    case 'TOKEN_MISSING':
      return 401; // Unauthorized
    case 'DATABASE_CONNECTION_ERROR':
    case 'AUTHENTICATION_ERROR':
    case 'TOKEN_GENERATION_FAILED':
    case 'JWT_SECRET_MISSING':
      return 500; // Server error
    case 'TOKEN_EXPIRED':
    case 'TOKEN_VERIFICATION_FAILED':
      return 403; // Forbidden
    default:
      return 400; // Bad request
  }
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode) {
  const errorMessages = {
    'USER_NOT_FOUND': 'User account no longer exists',
    'INVALID_PASSWORD': 'Incorrect password',
    'INVALID_CREDENTIALS': 'Invalid email or password',
    'DATABASE_CONNECTION_ERROR': 'Unable to connect to the database',
    'AUTHENTICATION_ERROR': 'An error occurred during authentication',
    'MISSING_CREDENTIALS': 'Email and password are required',
    'TOKEN_MISSING': 'Authentication token is missing',
    'TOKEN_EXPIRED': 'Your session has expired, please log in again',
    'TOKEN_INVALID': 'Invalid authentication token',
    'TOKEN_VERIFICATION_FAILED': 'Failed to verify authentication token',
    'USER_RETRIEVAL_ERROR': 'Error retrieving user data',
    'JWT_SECRET_MISSING': 'Authentication system configuration error',
    'SERVER_ERROR': 'An unexpected server error occurred'
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred';
}
