import clientPromise from '../db/mongodb';
import connectDB from '../db/db';
import User from '../models/User';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper to set JWT cookie
const setTokenCookie = (token) => {
  return serialize('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
};

// Register new user
export async function register(req, res) {
  try {
    await connectDB();
    
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user (password will be hashed by pre-save hook)
    const user = new User({
      name,
      email,
      password,
      subscription: {
        plan: 'bronze', // Default free tier
        status: 'active',
      }
    });
    
    await user.save();
    
    // Generate JWT token
    const token = user.generateAuthToken();
    
    // Set cookie
    res.setHeader('Set-Cookie', setTokenCookie(token));
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('[auth/register]', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Login user
export async function login(req, res) {
  try {
    await connectDB();
    
    const { email, password } = req.body;
    
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = user.generateAuthToken();
    
    // Set cookie
    res.setHeader('Set-Cookie', setTokenCookie(token));
    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('[auth/login]', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Logout user
export async function logout(req, res) {
  try {
    // Clear the cookie
    res.setHeader(
      'Set-Cookie',
      serialize('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: -1, // Expire immediately
        path: '/',
      })
    );
    
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[auth/logout]', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Get current user from token
export async function getCurrentUser(req, res) {
  try {
    await connectDB();
    
    const token = req.cookies['auth-token'];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('[auth/getCurrentUser]', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Update user subscription after Stripe webhook
export async function updateSubscription(userId, subscriptionData) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update subscription details
    user.subscription = {
      ...user.subscription,
      ...subscriptionData,
    };
    
    await user.save();
    
    return user;
  } catch (error) {
    console.error('[auth/updateSubscription]', error);
    throw error;
  }
}

// Verify user has access to content based on subscription plan
export async function verifyContentAccess(req, res) {
  try {
    await connectDB();
    
    const token = req.cookies['auth-token'];
    
    if (!token) {
      // For bronze/free content, allow access even without authentication
      if (req.query.plan === 'bronze') {
        return res.status(200).json({ hasAccess: true, plan: 'bronze' });
      }
      
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check subscription plan and status
    const { plan, status } = user.subscription;
    
    // Bronze content is always accessible
    if (req.query.plan === 'bronze') {
      return res.status(200).json({ hasAccess: true, plan });
    }
    
    // For silver and gold content, check subscription
    if (status !== 'active' && status !== 'trialing') {
      return res.status(403).json({ 
        hasAccess: false, 
        message: 'Subscription not active',
        plan,
        status
      });
    }
    
    // Silver plan can access silver content
    if (plan === 'silver' && req.query.plan === 'silver') {
      return res.status(200).json({ hasAccess: true, plan });
    }
    
    // Gold plan can access both silver and gold content
    if (plan === 'gold' && (req.query.plan === 'silver' || req.query.plan === 'gold')) {
      return res.status(200).json({ hasAccess: true, plan });
    }
    
    // Otherwise, no access
    return res.status(403).json({ 
      hasAccess: false, 
      message: 'Subscription plan does not have access to this content',
      plan,
      requestedPlan: req.query.plan
    });
  } catch (error) {
    console.error('[auth/verifyContentAccess]', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
