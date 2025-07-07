'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

// Define types
interface User {
  id: string;
  name?: string;
  email?: string;
  subscription?: {
    status?: string;
    plan?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  checkAccess: (contentId: string) => Promise<{ hasAccess: boolean; error?: string }>;
  refreshUser: () => Promise<{ success: boolean; error?: string }>;
  hasActiveSubscription: () => boolean;
  createSubscription: (tier: string) => Promise<{ success: boolean; sessionId?: string; url?: string; error?: string }>;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  redirect?: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update user state when session changes
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    try {
      // Handle potential session parsing errors
      if (session?.user) {
        setUser(session.user as User);
      } else {
        // Set user to null when no session
        setUser(null);
      }
    } catch (err) {
      console.error('Error processing session:', err);
      // Fallback to no user on session errors
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // Register a new user
  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
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
        email: userData.email,
        password: userData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error || 'Sign in after registration failed');
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in a user
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const result = await nextAuthSignIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error || 'Authentication failed');
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out a user
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has access to content
  const checkAccess = async (contentId: string) => {
    if (!user) return { hasAccess: false };

    try {
      const response = await fetch(`/api/auth/check-access?contentId=${contentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check access');
      }

      return { hasAccess: data.hasAccess };
    } catch (err: any) {
      console.error('Error checking access:', err);
      return { hasAccess: false, error: err.message };
    }
  };

  // Refresh user data from the server
  const refreshUser = async () => {
    if (!user) return { success: false };
    
    try {
      // Update the session data
      await updateSession();
      return { success: true };
    } catch (err: any) {
      console.error('Error refreshing user data:', err);
      return { success: false, error: err.message };
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
  const createSubscription = async (tier: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      return { 
        success: true, 
        sessionId: data.sessionId,
        url: data.url 
      };
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      return { success: false, error: err.message };
    }
  };

  // Auth context value
  const value: AuthContextType = {
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
