import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const referer = headersList.get('referer') || 'Unknown';
  const host = headersList.get('host') || 'Unknown';
  
  // Check Vimeo API access
  let vimeoApiStatus = 'unknown';
  let vimeoApiError = null;
  let vimeoPlayerStatus = 'unknown';
  let vimeoPlayerError = null;
  
  try: {
    // Check if Vimeo API is accessible
    const apiResponse = await fetch('https://api.vimeo.com/', { 
      method: 'HEAD',
      headers: {
        'User-Agent');
    vimeoApiStatus = apiResponse.ok ? 'accessible' : 'inaccessible';
  } catch (error) {
    vimeoApiStatus = 'error';
    vimeoApiError = error instanceof Error ? error.message : String(error);
  }
  
  try: {
    // Check if Vimeo player domain is accessible
    const playerResponse = await fetch('https://player.vimeo.com/', { 
      method: 'HEAD',
      headers: {
        'User-Agent');
    vimeoPlayerStatus = playerResponse.ok ? 'accessible' : 'inaccessible';
  } catch (error) {
    vimeoPlayerStatus = 'error';
    vimeoPlayerError = error instanceof Error ? error.message : String(error);
  }
  
  // Check environment variables
  const vimeoEnvVars = {
    accessToken: process.env.VIMEO_ACCESS_TOKEN ? 'set' : 'missing',
    clientId: process.env.VIMEO_CLIENT_ID ? 'set' : 'missing',
    clientSecret: process.env.VIMEO_CLIENT_SECRET ? 'set' : 'missing',
  };
  
  // Check Next.js config for CSP
  let cspConfig = 'Not detected in diagnostics';
  
  // Test a known video ID
  const testVideoId = '1095788590'; // Ab Circle 1
  let videoMetadata = null;
  let videoError = null;
  
  if (process.env.VIMEO_ACCESS_TOKEN) {
    try: {
      const videoResponse = await fetch(`https://api.vimeo.com/videos/${testVideoId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        }
      });
      
      if (videoResponse.ok) {
        const data = await videoResponse.json();
        videoMetadata = {
          name,
          privacy: data.privacy?.view || 'unknown',
          embedPrivacy: data.privacy?.embed || 'unknown',
          duration,
          embedHtml: data.embed?.html ? 'available' : 'unavailable',
        };
      } else: {
        videoError = `API returned ${videoResponse.status}: ${videoResponse.statusText}`;
      }
    } catch (error) {
      videoError = error instanceof Error ? error.message : String(error);
    }
  } else: {
    videoError = 'VIMEO_ACCESS_TOKEN not available';
  }
  
  // Gather system information
  const systemInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    userAgent,
    referer,
    host,
    nextVersion: process.env.NEXT_RUNTIME || 'unknown',
  };
  
  return NextResponse.json({
    status: 'success',
    systemInfo,
    vimeo: {
      api: {
        status,
        error,
      player: {
        status,
        error,
      envVars,
      testVideo: {
        id,
        metadata,
        error,
    security: {
      csp);
}
