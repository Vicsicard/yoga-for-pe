import { authenticateUser } from '../../../../auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    // Use the enhanced authenticateUser function from auth.js
    const result = await authenticateUser(email, password);
    
    if (result.success) {
      // Authentication successful
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Login successful',
          user: {
            id: result.user._id,
            name: result.user.name,
            email: result.user.email,
            subscription: result.user.subscription
          },
          token: result.token
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Authentication failed with specific error
      const statusCode = getStatusCodeFromError(result.error);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: result.errorDetails?.message || 'Authentication failed',
          errorCode: result.error
        }),
        { status: statusCode, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to determine appropriate HTTP status code based on error
function getStatusCodeFromError(errorCode) {
  switch (errorCode) {
    case 'USER_NOT_FOUND':
    case 'INVALID_PASSWORD':
    case 'INVALID_CREDENTIALS':
    case 'MISSING_CREDENTIALS':
      return 401; // Unauthorized
    case 'DATABASE_CONNECTION_ERROR':
    case 'AUTHENTICATION_ERROR':
    case 'TOKEN_GENERATION_FAILED':
    case 'JWT_SECRET_MISSING':
      return 500; // Server error
    case 'TOKEN_EXPIRED':
    case 'TOKEN_INVALID':
    case 'TOKEN_VERIFICATION_FAILED':
    case 'TOKEN_MISSING':
      return 403; // Forbidden
    default:
      return 400; // Bad request
  }
}
