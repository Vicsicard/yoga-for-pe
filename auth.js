// Set runtime to Node.js for auth file
export const runtime = 'nodejs';

// Prevent this file from being imported on the client side
if (typeof window !== 'undefined') {
  throw new Error('This module should not be imported on the client side');
}

import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

// Use dynamic imports to avoid Edge Runtime issues
let connectDB;
let User;

// Only import these on the server side
if (typeof window === 'undefined') {
  connectDB = require("./lib/db/index").connectDB;
  User = require("./lib/models/User").default;
}

const getUserFromCredentials = async (email, password) => {
  try {
    // Edge-safe mock user for build process
    // In production, the actual auth route will be used
    if (process.env.NODE_ENV === 'production' && !connectDB) {
      if (email === 'admin@yoga-for-pe.com' && password === 'admin') {
        return {
          id: '1',
          name: 'Admin User',
          email: 'admin@yoga-for-pe.com',
          subscription: {
            tier: 2,
            status: 'active',
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          }
        };
      }
      throw new Error('INVALID_CREDENTIALS');
    }

    // Connect to DB
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      throw new Error('DATABASE_CONNECTION_ERROR');
    }
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`User not found: ${email}`);
      throw new Error('USER_NOT_FOUND');
    }
    
    // Check password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      console.log(`Invalid password for user: ${email}`);
      throw new Error('INVALID_PASSWORD');
    }
    
    return user;
  } catch (error) {
    console.error('Error in getUserFromCredentials:', error);
    // Rethrow specific errors with context
    if (error.message === 'USER_NOT_FOUND' || 
        error.message === 'INVALID_PASSWORD' || 
        error.message === 'INVALID_CREDENTIALS' || 
        error.message === 'DATABASE_CONNECTION_ERROR') {
      throw error;
    }
    // For unexpected errors
    throw new Error('AUTHENTICATION_ERROR');
  }
};

// Generate JWT token for authenticated user
export const generateToken = (user) => {
  if (!user || !user._id) {
    throw new Error('INVALID_USER_DATA');
  }
  
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not defined');
    throw new Error('JWT_SECRET_MISSING');
  }
  
  try {
    // Create payload with essential user data and subscription info
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      subscription: user.subscription || { status: 'inactive' }
    };
    
    // Sign token with JWT_SECRET from environment variables
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('TOKEN_GENERATION_FAILED');
  }
};

// Verify JWT token and return decoded user data
export const verifyToken = (token) => {
  if (!token) {
    throw new Error('TOKEN_MISSING');
  }
  
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not defined');
    throw new Error('JWT_SECRET_MISSING');
  }
  
  try {
    // Verify token with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure userId is a string for MongoDB compatibility
    if (!decoded.userId) {
      console.error('Token missing userId');
      throw new Error('INVALID_TOKEN_PAYLOAD');
    }
    
    // Ensure userId is a string
    if (typeof decoded.userId !== 'string') {
      console.error('Token userId is not a string:', typeof decoded.userId);
      decoded.userId = String(decoded.userId);
      console.log('Converted userId to string:', decoded.userId);
    }
    
    // Log userId for debugging
    console.log('Token contains userId:', decoded.userId);
    console.log('userId type after verification:', typeof decoded.userId);
    
    return decoded;
  } catch (error) {
    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('INVALID_TOKEN');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('TOKEN_NOT_ACTIVE');
    }
    
    // Re-throw custom errors
    if (error.message === 'TOKEN_MISSING' || 
        error.message === 'INVALID_TOKEN_PAYLOAD') {
      throw error;
    }
    
    // Default error
    console.error('Token verification error:', error);
    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
};

// Authenticate user with email and password
export const authenticateUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('MISSING_CREDENTIALS');
  }
  
  try {
    const user = await getUserFromCredentials(email, password);
    if (!user) {
      throw new Error('AUTHENTICATION_FAILED');
    }
    
    // Generate token for authenticated user
    const token = generateToken(user);
    return { 
      user, 
      token,
      success: true
    };
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    // Return structured error response
    return { 
      success: false, 
      error: error.message,
      errorDetails: {
        code: error.message,
        message: getErrorMessage(error.message)
      }
    };
  }
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'USER_NOT_FOUND': 'No account found with this email address',
    'INVALID_PASSWORD': 'Incorrect password',
    'INVALID_CREDENTIALS': 'Invalid email or password',
    'DATABASE_CONNECTION_ERROR': 'Unable to connect to the database',
    'AUTHENTICATION_ERROR': 'An error occurred during authentication',
    'MISSING_CREDENTIALS': 'Email and password are required',
    'AUTHENTICATION_FAILED': 'Authentication failed',
    'TOKEN_MISSING': 'Authentication token is missing',
    'TOKEN_EXPIRED': 'Your session has expired, please log in again',
    'TOKEN_INVALID': 'Invalid authentication token',
    'TOKEN_VERIFICATION_FAILED': 'Failed to verify authentication token',
    'INVALID_USER_DATA': 'Invalid user data for token generation',
    'JWT_SECRET_MISSING': 'Authentication system configuration error',
    'TOKEN_GENERATION_FAILED': 'Failed to generate authentication token'
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred';
};

// Export the getUserFromCredentials function for direct use
export { getUserFromCredentials };
