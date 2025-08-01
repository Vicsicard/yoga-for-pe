import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import emailService from '../../../../lib/services/email';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// MongoDB connection with error handling
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
}

// Cache MongoDB connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch(error => {
        console.error('MongoDB connection error:', error);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('MongoDB URI exists:', !!MONGODB_URI);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// User model schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  subscription: {
    status: { type: String, default: 'inactive' },
    plan: { type: String, default: 'bronze' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Get User model (with handling for model compilation errors)
const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function POST(request) {
  try {
    console.log('Forgot password route called');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', details: parseError.message },
        { status: 400 }
      );
    }
    
    // Log request body (without sensitive data)
    console.log('Request body:', { ...body });
    
    const { email } = body;
    
    // Validate input
    if (!email) {
      console.log('Missing email');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed', 
          details: dbError.message,
          name: dbError.name,
          code: dbError.code || 'unknown'
        },
        { status: 500 }
      );
    }
    
    // Check if user exists
    let user;
    try {
      user = await User.findOne({ email }).exec();
      console.log('User lookup result:', user ? 'Found' : 'Not found');
    } catch (findError) {
      console.error('Error finding user:', findError);
      return NextResponse.json(
        { 
          error: 'Error checking email', 
          details: findError.message,
          name: findError.name,
          code: findError.code || 'unknown'
        },
        { status: 500 }
      );
    }
    
    // Generate reset token if user exists
    if (user) {
      try {
        // Create a JWT token with the user's email
        const token = jwt.sign(
          { email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        // Store token and expiration in user document
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        // Generate reset URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;
        
        console.log('Reset URL generated:', resetUrl);
        
        // Send password reset email using our email service
        try {
          await emailService.sendPasswordResetEmail({
            email,
            resetUrl
          });
          console.log('Password reset email sent successfully to:', email);
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
          // Don't expose email sending errors to client for security
        }
      } catch (tokenError) {
        console.error('Error generating reset token:', tokenError);
        // Don't expose error details to client for security
      }
    }
    
    // For security, always return a generic success message
    // regardless of whether the email exists or not
    return NextResponse.json(
      { message: 'If an account exists with this email, password reset instructions have been sent.' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Forgot password error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        errorType: error.name || 'Unknown',
        errorCode: error.code || 'none',
        env: process.env.NODE_ENV || 'unknown'
      },
      { status: 500 }
    );
  }
}
