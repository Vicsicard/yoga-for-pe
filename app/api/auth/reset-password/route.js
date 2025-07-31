import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// MongoDB connection with error handling
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
}

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
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
  console.log('Reset password API called');
  
  try {
    // Check environment variables
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!MONGODB_URI) {
      console.error('MONGODB_URI is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Parse request body
    const { token, password } = await request.json();
    
    // Validate input
    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }
    
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    try {
      // Verify the reset token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded:', decoded);
      
      // Find user with matching email and valid reset token
      const user = await User.findOne({
        email: decoded.email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        console.error('Invalid or expired reset token');
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user's password and clear reset token fields
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.updatedAt = Date.now();
      
      await user.save();
      
      console.log('Password reset successful for user:', user.email);
      
      return NextResponse.json({ 
        message: 'Password has been reset successfully' 
      }, { status: 200 });
      
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'An error occurred while resetting your password' }, { status: 500 });
  }
}
