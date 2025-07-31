import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../../lib/db/index';
import User from '../../../../lib/models/User';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    console.log('Set password request received');
    
    // Parse request body
    const { token, password } = await request.json();
    
    // Validate input
    if (!token || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Token and password are required' },
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
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully, decoded userId:', decoded.userId);
      
      // Validate that userId is present
      if (!decoded.userId) {
        console.error('Invalid token: missing userId');
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError.message);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Connect to database
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Find user by ID
    let user;
    try {
      user = await User.findById(decoded.userId);
      
      if (!user) {
        console.error('User not found for ID:', decoded.userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      console.log('User found:', user.email);
    } catch (findError) {
      console.error('Error finding user:', findError);
      return NextResponse.json(
        { error: 'Error finding user account' },
        { status: 500 }
      );
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    console.log('User password updated successfully');
    
    // Generate new JWT token with updated user info
    const newToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name || user.email.split('@')[0],
        subscription: {
          plan: user.subscription?.plan || 'bronze',
          status: user.subscription?.status || 'inactive',
          currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
          stripeCustomerId: user.subscription?.stripeCustomerId || null,
          stripeSubscriptionId: user.subscription?.stripeSubscriptionId || null
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return success response with new token
    return NextResponse.json({
      message: 'Password set successfully',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      }
    });
    
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
