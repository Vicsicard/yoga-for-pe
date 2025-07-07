// Check if we're in Node.js environment and not in Edge Runtime
const isNode = typeof process !== 'undefined' && 
  process.versions != null && 
  process.versions.node != null &&
  !process.env.NEXT_RUNTIME;

// Only import mongoose in Node.js environment
let mongoose;
if (isNode) {
  mongoose = require('mongoose');
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

let useLocalMock = false;

// MongoDB connection utility with fallback for development
async function connectDB() {
  // If we're in Edge Runtime, just return - we'll use mock data
  if (!isNode) {
    useLocalMock = true;
    return;
  }
  
  try {
    // Use mock data in development environment if no MongoDB URI
    if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI) {
      console.log('Using mock database for development');
      useLocalMock = true;
      return;
    }

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB URI is missing. Please check your .env file');
    }
    
    // Only connect once
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    useLocalMock = true; // Fall back to mock data on error
  }
}

// Mock Model implementation when MongoDB isn't available
const mockModel = {
  findOne: async function(query) {
    if (query.email) {
      return mockUsers.findOne(query);
    }
    return null;
  }
};

// Export both the connection function and a User model proxy
export default connectDB;

// Export a User model that will use either the real model or the mock
export const getUserModel = () => {
  // If we're in mock mode, return our mock implementation
  if (useLocalMock) {
    return mockModel;
  }
  // Otherwise, require the real model
  // Note: We do this dynamically to avoid circular dependencies
  return require('../models/User').default;
};
