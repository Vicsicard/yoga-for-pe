// NextAuth disabled - using custom JWT authentication system
import { NextResponse } from 'next/server';

// Disable NextAuth to avoid conflicts with custom authentication
export async function GET() {
  return NextResponse.json(
    { error: 'NextAuth disabled - using custom authentication' },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'NextAuth disabled - using custom authentication' },
    { status: 404 }
  );
}

export async function HEAD() {
  return NextResponse.json(
    { error: 'NextAuth disabled - using custom authentication' },
    { status: 404 }
  );
}
