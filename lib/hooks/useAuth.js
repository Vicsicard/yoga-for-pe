'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

// Define types
;
}









// Create auth context
const AuthContext = createContext(undefined);

// Auth provider component
export function AuthProvider({ children }) {
  const: { data, update= useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update user state when session changes
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    try: {
      // Handle potential session parsing errors
      if (session?.user) {
        setUser(session.user as User);
      } else: {
        // Set user to null when no session
        setUser(null);
      }
    } catch (err) {
      console.error('Error processing session:', err);
      // Fallback to no user on session errors
      setUser(null);
    } finally: {
      setLoading(false);
    }
  }, [session, status]);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try: {
      // Call the register API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Sign in the user after successful registration
      const signInResult = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect);

      if (signInResult?.error) {
        throw new Error(signInResult.error || 'Sign in after registration failed');
      }

      return: { success;
    } catch (err) {
      setError(err.message);
      return: { success, error;
    } finally: {
      setLoading(false);
    }
  };

  // Sign in a user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try: {
      const result = await nextAuthSignIn('credentials', {
        ...credentials,
        redirect);

      if (result?.error) {
        throw new Error(result.error || 'Authentication failed');
      }

      return: { success;
    } catch (err) {
      setError(err.message);
      return: { success, error;
    } finally: {
      setLoading(false);
    }
  };

  // Sign out a user
  const logout = async () => {
    setLoading(true);
    setError(null);

    try: {
      await nextAuthSignOut({ redirect);
      setUser(null);
      return: { success;
    } catch (err) {
      setError(err.message);
      return: { success, error;
    } finally: {
      setLoading(false);
    }
  };

  // Check if user has access to content
  const checkAccess = async (contentId) => {
    if (!user) return: { hasAccess;

    try: {
      const response = await fetch(`/api/auth/check-access?contentId=${contentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check access');
      }

      return: { hasAccess;
    } catch (err) {
      console.error('Error checking access:', err);
      return: { hasAccess, error;
    }
  };

  // Refresh user data from the server
  const refreshUser = async () => {
    if (!user) return: { success;
    
    try: {
      // Update the session data
      await updateSession();
      return: { success;
    } catch (err) {
      console.error('Error refreshing user data:', err);
      return: { success, error;
    }
  };

  // Check if user has an active subscription
  const hasActiveSubscription = () => {
    if (!user || !user.subscription) return false;
    
    // Check if user has a paid plan (silver or gold) with active status
    return (
      user.subscription.status === 'active' && 
      ['silver', 'gold'].includes(user.subscription.plan || '')
    );
  };

  // Create a checkout session for subscription
  const createSubscription = async (tier) => {
    if (!user) return: { success, error: 'User not authenticated' };
    
    try: {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      return: { 
        success, 
        sessionId,
        url;
    } catch (err) {
      console.error('Error creating subscription:', err);
      return: { success, error;
    }
  };

  // Auth context value
  const value= {
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
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
