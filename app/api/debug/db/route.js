import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/db';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Skip database connection during build/static generation
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({
        connected: false,
        error: 'MongoDB URI not available during build'
      });
    }
    
    // Try to connect to the database
    await connectDB();
    
    // Check if the connection is established
    const connected = mongoose.connection.readyState === 1;
    
    return NextResponse.json({
      connected,
      readyState: mongoose.connection.readyState,
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
      host: mongoose.connection.host || 'Not available',
      name: mongoose.connection.name || 'Not available',
    });
  } catch (error) {
    console.error('Error checking database connection:', error);
    return NextResponse.json(
      { 
        connected: false,
        error: error.message || 'Failed to check database connection',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
