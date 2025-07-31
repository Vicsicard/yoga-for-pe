import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    console.log('Signin route called - v2');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI value:', process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : 'undefined');
    
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error', details: 'JWT_SECRET is not defined' },
        { status: 500 }
      );
    }
    
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      console.error('Database error name:', dbError.name);
      console.error('Database error code:', dbError.code);
      console.error('Database error stack:', dbError.stack);
      
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
    
    // Verify mongoose connection is active
    if (mongoose.connection.readyState !== 1) {
      console.error('Mongoose connection is not active. Current state:', mongoose.connection.readyState);
      return NextResponse.json(
        { error: 'Database connection is not active', details: `Connection state: ${mongoose.connection.readyState}` },
        { status: 500 }
      );
    }
    
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format', details: parseError.message },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    
    console.log('Signin attempt for email:', email);
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user
    console.log('Finding user with email:', email);
    let user;
    try {
      user = await User.findOne({ email }).exec();
      console.log('User lookup result:', user ? 'Found' : 'Not found');
    } catch (findError) {
      console.error('Error finding user:', findError);
      return NextResponse.json(
        { 
          error: 'Error finding user', 
          details: findError.message,
          name: findError.name,
          code: findError.code || 'unknown'
        },
        { status: 500 }
      );
    }
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check password
    console.log('Checking password...');
    let isPasswordValid;
    try {
      if (!user.password) {
        console.error('User has no password stored');
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (passwordError) {
      console.error('Error comparing passwords:', passwordError);
      return NextResponse.json(
        { 
          error: 'Error verifying password', 
          details: passwordError.message 
        },
        { status: 500 }
      );
    }
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password comparison failed');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    // Ensure user._id is properly converted to string
    const userId = user._id ? user._id.toString() : null;
    console.log('Generating token with userId:', userId);
    console.log('User ID type:', typeof userId);
    console.log('User ID value:', userId);
    console.log('User object ID:', user._id);
    console.log('User object ID type:', typeof user._id);
    console.log('User subscription:', user.subscription || 'none');
    
    if (!userId) {
      console.error('Invalid user ID for token generation');
      return NextResponse.json(
        { error: 'Authentication error: Invalid user ID' },
        { status: 500 }
      );
    }
    
    let token;
    try {
      // Prepare subscription data safely
      const subscriptionData = {
        plan: user.subscription?.plan || 'bronze',
        status: user.subscription?.status || 'inactive',
        currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
        stripeCustomerId: user.subscription?.stripeCustomerId || null,
        stripeSubscriptionId: user.subscription?.stripeSubscriptionId || null
      };
      
      // Generate token with safe data
      token = jwt.sign(
        { 
          userId: userId,
          email: user.email,
          name: user.name || email.split('@')[0],
          subscription: subscriptionData
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log('JWT token generated successfully');
      
      // Verify token immediately to ensure it's valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully, expiry:', new Date(decoded.exp * 1000).toISOString());
    } catch (tokenError) {
      console.error('Error with JWT token:', tokenError);
      return NextResponse.json(
        { 
          error: 'Error generating authentication token', 
          details: tokenError.message 
        },
        { status: 500 }
      );
    }
    
    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription,
    };
    
    return NextResponse.json(
      { 
        message: 'Login successful',
        user: userData,
        token 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Signin error:', error);
    console.error('Error stack:', error.stack);
    
    // Log more detailed information about the error
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('MongoDB error code:', error.code);
      console.error('MongoDB error message:', error.message);
    }
    
    // Check for connection issues
    if (error.message && error.message.includes('connect')) {
      console.error('Connection error details:', error.message);
    }
    
    // Check for environment variables
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.error('MONGODB_URI value:', process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : 'undefined');
    console.error('NODE_ENV:', process.env.NODE_ENV);
    console.error('VERCEL_ENV:', process.env.VERCEL_ENV);
    
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
