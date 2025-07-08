import { verifyContentAccess } from '../../../../lib/controllers/auth.controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // Get the plan from query parameters
    const url = new URL(req.url);
    const plan = url.searchParams.get('plan');
    
    if (!plan) {
      return new Response(
        JSON.stringify({ message: 'Plan parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Mock request and response objects for the controller
    const mockReq = {
      query: { plan },
      cookies: req.cookies
    };
    
    // Use a custom response object that captures the response
    let statusCode = 200;
    let responseBody = {};
    
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseBody = data;
          }
        };
      }
    };
    
    // Call the controller function
    await verifyContentAccess(mockReq, mockRes);
    
    // Return the response
    return new Response(
      JSON.stringify(responseBody),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[api/auth/access]', error);
    return new Response(
      JSON.stringify({ message: 'Server error', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
