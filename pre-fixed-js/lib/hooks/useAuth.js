'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

// Create a context for authentication
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  // Get session data and status
  const sessionData = useSession();
  const session = sessionData.data;
  const status = sessionData.status;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update user when session changes
  useEffect(() => {
    if (session && session.user) {
      setUser({
        id: session.user.id || (session.user._id || ''),
        name: session.user.name || '',
        email: session.user.email || '',
        subscription: session.user.subscription || null
      });
      setLoading(false);
    } else if (status === 'unauthenticated') {
      setUser(null);
      setLoading(false);
    }
  }, [session, status]);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Auto login after registration
      return await login({ 
        email: userData.email, 
        password: userData.password 
      });
    } catch (err) {
      setError(err.message);
      return { "success": false, "error": err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await nextAuthSignIn('credentials', {
        ...credentials,
        "redirect": false
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Refresh the session
      await refreshUser();
      return { "success": true };
    } catch (err) {
      setError(err.message);
      return { "success": false, "error": err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await nextAuthSignOut({ "redirect": false });
      setUser(null);
      return { "success": true };
    } catch (err) {
      setError(err.message);
      return { "success": false, "error": err.message };
    }
  };

  // Check if user can access specific content
  const checkAccess = async (contentId) => {
    try {
      if (!user) {
        return { "hasAccess": false };
      }
      
      const response = await fetch(`/api/subscription/check-access?contentId=${contentId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return { "hasAccess": data.hasAccess };
    } catch (err) {
      return { "hasAccess": false, "error": err.message };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh user');
      }
      
      setUser(data.user);
      return { "success": true };
    } catch (err) {
      setError(err.message);
      return { "success": false, "error": err.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has an active subscription
  const hasActiveSubscription = () => {
    if (!user || !user.subscription) {
      return false;
    }
    
    // Check if subscription is active
    return user.subscription.status === 'active' && 
           new Date(user.subscription.currentPeriodEnd) > new Date();
  };

  // Create a subscription
  const createSubscription = async (tier) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to subscribe');
      }
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }
      
      return { 
        "success": true, 
        "sessionId": data.sessionId,
        "url": data.url
      };
    } catch (err) {
      setError(err.message);
      return { "success": false, "error": err.message };
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    checkAccess,
    refreshUser,
    hasActiveSubscription,
    createSubscription,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the provider
export default useAuth;
