import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || '';
  const queryParams = Object.fromEntries(searchParams.entries());
  
  // Remove the endpoint parameter as it's not needed for the actual Vimeo request
  delete queryParams.endpoint;
  
  // Build the query string for the Vimeo API request
  const queryString = new URLSearchParams(queryParams).toString();
  
  // Get the access token from environment variables
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  const clientId = process.env.VIMEO_CLIENT_ID;
  const clientSecret = process.env.VIMEO_CLIENT_SECRET;
  
  // Enhanced environment variable checking
  const missingVars = [];
  if (!accessToken) missingVars.push('VIMEO_ACCESS_TOKEN');
  if (!clientId) missingVars.push('VIMEO_CLIENT_ID');
  if (!clientSecret) missingVars.push('VIMEO_CLIENT_SECRET');
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing Vimeo environment variables: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    
    // Log more details about the environment
    console.error(`Environment: ${process.env.NODE_ENV}`);
    console.error(`Environment variables available: ${Object.keys(process.env).filter(key => key.startsWith('VIMEO')).join(', ')}`);
    
    return NextResponse.json(
      { 
        error: 'Vimeo configuration error', 
        message,
        environment: process.env.NODE_ENV || 'unknown',
        missingVars,
        availableEnvVars: Object.keys(process.env).filter(key => key.startsWith('VIMEO')).length
      },
      { status);
  }

  try: {
    // Log the request being made (without the token)
    console.log(`Making Vimeo API request to: https://api.vimeo.com/${endpoint}?${queryString}`);
    console.log(`Environment: ${process.env.NODE_ENV}, Token length: ${accessToken.length}`);
    
    // Make the request to standard Vimeo API
    const apiUrl = `https://api.vimeo.com/${endpoint}?${queryString}`;
    console.log(`Full API URL: ${apiUrl}`);
    
    const response = await fetch(
      apiUrl,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vimeo API error (${response.status}):`, errorText);
      
      // Try to parse the error as JSON for more details
      let parsedError = {};
      try: {
        parsedError = JSON.parse(errorText);
      } catch (e) {
        // If it's not valid JSON, use the raw text
        parsedError = { raw;
      }
      
      return NextResponse.json(
        { 
          error: `Vimeo API error (${response.status})`, 
          message,
          details,
          endpoint,
          url,
        { status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to Vimeo:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Vimeo', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack ,
        endpoint,
        environment: process.env.NODE_ENV || 'unknown'
      },
      { status);
  }
}
