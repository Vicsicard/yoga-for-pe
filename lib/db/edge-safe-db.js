// Edge Runtime-safe database module
// This creates a version of the database utilities that works in Edge Runtime

// Export a runtime directive
export const runtime = 'nodejs';

// Empty mock objects for Edge Runtime
const mockUser = {
  findOne: () => Promise.resolve(null),
  findById: () => Promise.resolve(null),
  create: () => Promise.resolve(null)
};

// Safe connect function that doesn't use mongoose in Edge Runtime
export async function connectDB() {
  console.log('Using mock DB in Edge Runtime');
  return Promise.resolve();
}

// Get a User model that works in any runtime
export function getUserModel() {
  return mockUser;
}

// Default export
export default connectDB;
