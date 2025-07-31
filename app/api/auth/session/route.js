import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

// JWT token verification function
function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET_MISSING');
  }
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('INVALID_TOKEN');
    } else {
      throw new Error('TOKEN_VERIFICATION_FAILED');
    }
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication token is missing',
        errorCode: 'TOKEN_MISSING'
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    let decoded;
    try {
      decoded = verifyToken(token);
      console.log('Token verified successfully, decoded userId:', decoded.userId);
      console.log('Token contains subscription data:', !!decoded.subscription);
      console.log('User ID type:', typeof decoded.userId);
      
      // Validate that userId is a string and looks like a valid MongoDB ObjectId
      if (!decoded.userId || typeof decoded.userId !== 'string' || decoded.userId.length !== 24) {
        console.error('Invalid userId in token:', decoded.userId);
        return NextResponse.json({
          success: false,
          message: 'Invalid user ID in authentication token',
          errorCode: 'INVALID_USER_ID'
        }, { status: 401 });
      }
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError.message);
      console.error('Token value (first 10 chars):', token.substring(0, 10) + '...');
      const errorCode = tokenError.message;
      const statusCode = getStatusCodeFromError(errorCode);
      const errorMessage = getErrorMessage(errorCode);
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        errorCode: errorCode
      }, { status: statusCode });
    }
    
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Unable to connect to the database',
        errorCode: 'DATABASE_CONNECTION_ERROR'
      }, { status: 500 });
    }
    
    // Find user
    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'User account no longer exists',
          errorCode: 'USER_NOT_FOUND'
        }, { status: 404 });
      }
      
      // Return user data
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      };
      
      return NextResponse.json({
        success: true,
        user: userData
      }, { status: 200 });
    } catch (userError) {
      console.error('User retrieval error:', userError);
      return NextResponse.json({
        success: false,
        message: 'Error retrieving user data',
        errorCode: 'USER_RETRIEVAL_ERROR'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Session error:', error);
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to determine appropriate HTTP status code based on error
function getStatusCodeFromError(errorCode) {
  switch (errorCode) {
    case 'USER_NOT_FOUND':
    case 'USER_RETRIEVAL_ERROR':
      return 404; // Not found
    case 'INVALID_PASSWORD':
    case 'INVALID_CREDENTIALS':
    case 'MISSING_CREDENTIALS':
    case 'TOKEN_INVALID':
    case 'TOKEN_MISSING':
      return 401; // Unauthorized
    case 'DATABASE_CONNECTION_ERROR':
    case 'AUTHENTICATION_ERROR':
    case 'TOKEN_GENERATION_FAILED':
    case 'JWT_SECRET_MISSING':
      return 500; // Server error
    case 'TOKEN_EXPIRED':
    case 'TOKEN_VERIFICATION_FAILED':
      return 403; // Forbidden
    default:
      return 400; // Bad request
  }
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode) {
  const errorMessages = {
    'USER_NOT_FOUND': 'User account no longer exists',
    'INVALID_PASSWORD': 'Incorrect password',
    'INVALID_CREDENTIALS': 'Invalid email or password',
    'DATABASE_CONNECTION_ERROR': 'Unable to connect to the database',
    'AUTHENTICATION_ERROR': 'An error occurred during authentication',
    'MISSING_CREDENTIALS': 'Email and password are required',
    'TOKEN_MISSING': 'Authentication token is missing',
    'TOKEN_EXPIRED': 'Your session has expired, please log in again',
    'TOKEN_INVALID': 'Invalid authentication token',
    'TOKEN_VERIFICATION_FAILED': 'Failed to verify authentication token',
    'USER_RETRIEVAL_ERROR': 'Error retrieving user data',
    'JWT_SECRET_MISSING': 'Authentication system configuration error',
    'SERVER_ERROR': 'An unexpected server error occurred'
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred';
}
