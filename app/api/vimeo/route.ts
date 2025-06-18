import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || '';
  const queryParams = Object.fromEntries(searchParams.entries());
  
  // Remove the endpoint parameter as it's not needed for the actual Vimeo request
  delete queryParams.endpoint;
  
  // Build the query string for the Vimeo API request
  const queryString = new URLSearchParams(queryParams).toString();
  
  // Get the API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_VIMEO_OTT_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Vimeo OTT API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Make the request to Vimeo OTT API
    const response = await fetch(
      `https://api.vimeo.com/ott/${endpoint}?${queryString}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Vimeo API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to Vimeo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Vimeo' },
      { status: 500 }
    );
  }
}
