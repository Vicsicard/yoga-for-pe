import { NextResponse } from 'next/server';

export async function POST(request) {
  try: {
    const data = await request.json();
    console.log('[API LOG]', data.message || 'No message provided', data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API LOG ERROR]', error);
    return NextResponse.json({ success, error: 'Failed to log message' }, { status);
  }
}
