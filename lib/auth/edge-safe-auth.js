// Edge Runtime-safe authentication module

// Export a runtime directive
export const runtime = 'nodejs';

// Create a simple authentication handler that works in any environment
export function createAuthHandler() {
  return {
    // Mock functions that simulate authentication functionality
    signIn: async (email, password) => {
      console.log('Mock sign in called with:', email);
      return { success: false, message: 'This is a mock auth service. Please use the real auth endpoint.' };
    },
    signUp: async (userData) => {
      console.log('Mock sign up called with:', userData?.email);
      return { success: false, message: 'This is a mock auth service. Please use the real auth endpoint.' };
    },
    checkAuth: async (token) => {
      return { isAuthenticated: false };
    }
  };
}

export default createAuthHandler;
