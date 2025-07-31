// Force Node.js runtime - this tells Next.js not to use Edge Runtime for this module
export const runtime = 'nodejs';

// IMPORTANT: Prevent this module from being imported on the client side
// But allow it in test environments using require
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  throw new Error('This module should not be imported on the client side');
}

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Standard MongoDB connection function to be used across the application
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
export async function connectDB() {
  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI.substring(0, 20) + '...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully!');
      return mongoose;
    }).catch(error => {
      console.error('MongoDB connection error:', error);
      console.error('Error name:', error.name);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('MongoDB URI exists:', !!MONGODB_URI);
      console.error('MongoDB URI length:', MONGODB_URI?.length || 0);
      
      // Add specific error handling for common MongoDB connection issues
      if (error.name === 'MongoServerSelectionError') {
        console.error('Could not connect to any MongoDB server. Please check your network connection and MongoDB URI.');
      } else if (error.name === 'MongoParseError') {
        console.error('Invalid MongoDB connection string. Please check your MONGODB_URI format.');
      } else if (error.code === 'ENOTFOUND') {
        console.error('MongoDB host not found. Please check your MongoDB URI hostname.');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('MongoDB connection refused. Please check if MongoDB server is running.');
      }
      
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

// Mock user for development when MongoDB isn't available
const mockUsers = {
  users: [
    {
      _id: 'mock-user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: '$2a$10$D8xMKCDmI95PFzQtBHAdteNVR.bn5nRyz9wGJkZlUy87uf3MFlKJG', // 'password123'
      subscription: {
        status: 'active',
        plan: 'gold',
        stripeCustomerId: 'cus_mock123',
        stripeSubscriptionId: 'sub_mock123',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }
  ],
  findOne: function({ email }) {
    const user = this.users.find(u => u.email === email);
    if (!user) return null;
    
    // Create a mongoose-like document from our mock user
    return {
      ...user,
      _id: { toString: () => user._id },
      select: function() { return this; }, // For .select('+password')
      comparePassword: async function(candidatePassword) {
        // In a real app, you'd use bcrypt.compare
        return candidatePassword === 'password123';
      }
    };
  }
};

// Export both the connection function and a flag for mock data
export const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
export const useMockData = !isNode || process.env.USE_MOCK_DATA === 'true';

// Default export for backward compatibility
export default connectDB;
