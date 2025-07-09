import memoryStore from './memory-store';

// Development connection that falls back to memory store if MongoDB fails
export async function connectDB() {
  // For development, we'll use the memory store
  // In production, you would connect to your actual MongoDB
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Using in-memory store for development');
    return { connected: true, store: memoryStore };
  }
  
  // In production, you would implement actual MongoDB connection here
  try {
    // Actual MongoDB connection would go here
    throw new Error('MongoDB connection not configured for production');
  } catch (error) {
    console.log('Falling back to memory store due to MongoDB connection error');
    return { connected: true, store: memoryStore };
  }
}

// Simple User model for development
export const User = {
  async create(userData) {
    return await memoryStore.createUser(userData);
  },
  
  async findOne(query) {
    if (query.email) {
      return await memoryStore.findUserByEmail(query.email);
    }
    if (query._id) {
      return await memoryStore.findUserById(query._id);
    }
    return null;
  },
  
  async findById(id) {
    return await memoryStore.findUserById(id);
  },
  
  async findByIdAndUpdate(id, updates) {
    return await memoryStore.updateUser(id, updates);
  }
};
