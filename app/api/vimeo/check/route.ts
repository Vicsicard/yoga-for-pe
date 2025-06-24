import { NextResponse } from 'next/server';

export async function GET() {
  // Check for Vimeo environment variables
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  const clientId = process.env.VIMEO_CLIENT_ID;
  const clientSecret = process.env.VIMEO_CLIENT_SECRET;
  
  // Mask the tokens for security (show only first and last 4 chars)
  const maskToken = (token: string | undefined) => {
    if (!token) return 'not set';
    if (token.length <= 8) return '****';
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
  };

  // Return the status of environment variables
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    vimeo_access_token: {
      exists: !!accessToken,
      value: maskToken(accessToken),
      length: accessToken?.length || 0
    },
    vimeo_client_id: {
      exists: !!clientId,
      value: maskToken(clientId),
      length: clientId?.length || 0
    },
    vimeo_client_secret: {
      exists: !!clientSecret,
      value: maskToken(clientSecret),
      length: clientSecret?.length || 0
    }
  });
}
