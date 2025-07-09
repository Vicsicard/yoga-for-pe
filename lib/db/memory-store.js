// Simple in-memory store for development testing
// Replace with actual database in production

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.nextId = 1;
  }

  async createUser(userData) {
    const user = {
      _id: this.nextId.toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user._id, user);
    this.nextId++;
    return user;
  }

  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id) || null;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id) {
    return this.users.delete(id);
  }

  // Get all users (for debugging)
  getAllUsers() {
    return Array.from(this.users.values());
  }

  // Clear all data (for testing)
  clear() {
    this.users.clear();
    this.nextId = 1;
  }
}

// Create a singleton instance
const memoryStore = new MemoryStore();

// Add a test user for development
import bcrypt from 'bcryptjs';

// Initialize with a test user
(async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await memoryStore.createUser({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      subscription: {
        plan: 'bronze',
        status: 'active'
      }
    });
    console.log('Test user created: test@example.com / password123');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
})();

export default memoryStore;
