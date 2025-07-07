import mongoose from 'mongoose';

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
const connectDB = async () => {
  // If already connected or in mock mode, return
  if (mongoose.connection.readyState >= 1 || useLocalMock) return;
  
  const uri = process.env.MONGODB_URI;
  
  // No URI provided
  if (!uri) {
    console.warn('[db] No MONGODB_URI provided, falling back to mock data mode');
    useLocalMock = true;
    return;
  }
  
  try {
    // Connect without deprecated options
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected successfully');
  } catch (error) {
    console.error('[db] MongoDB connection error:', error);
    console.warn('[db] Falling back to mock data mode');
    useLocalMock = true;
  }
};

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
