import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
    const { name, email, password } = await request.json();

    console.log('Signup attempt:', { name, email, passwordLength: password?.length });

    // Validate input
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    console.log('No existing user found, proceeding with signup');

    // Hash password
    console.log('Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    // Create user with default subscription
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      subscription: {
        plan: 'bronze',
        status: 'active',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }
    });

    // Generate JWT token
    // Ensure newUser._id is properly converted to string
    const userId = newUser._id ? newUser._id.toString() : null;
    console.log('Generating token with userId:', userId);
    console.log('User ID type:', typeof userId);
    
    if (!userId) {
      console.error('Invalid user ID for token generation');
      return NextResponse.json(
        { error: 'Authentication error: Invalid user ID' },
        { status: 500 }
      );
    }
    
    const token = jwt.sign(
      { 
        userId: userId,
        email: newUser.email,
        name: newUser.name,
        subscription: {
          plan: newUser.subscription?.plan || 'bronze',
          status: newUser.subscription?.status || 'active',
          currentPeriodEnd: newUser.subscription?.currentPeriodEnd || null,
          stripeCustomerId: newUser.subscription?.stripeCustomerId || null,
          stripeSubscriptionId: newUser.subscription?.stripeSubscriptionId || null
        }
      },
      process.env.JWT_SECRET || 'development-secret-key',
      { expiresIn: '7d' }
    );

    // Send welcome email to the new user
    try {
      await emailService.sendWelcomeEmail({
        name: newUser.name,
        email: newUser.email
      });
      console.log('Welcome email sent successfully to:', newUser.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with the response even if email fails
    }

    // Return success response with token
    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        subscription: newUser.subscription
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
