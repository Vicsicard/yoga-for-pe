import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('[API LOG]', data.message || 'No message provided', data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API LOG ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to log message' }, { status: 500 });
  }
}
