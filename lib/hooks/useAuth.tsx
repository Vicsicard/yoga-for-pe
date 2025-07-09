'use client';

// THIS FILE IS DISABLED - NextAuth-based authentication system removed
// Use ../contexts/AuthContext.js instead for custom JWT authentication

// Throwing error to prevent accidental usage of this NextAuth-based hook
export function useAuth() {
  throw new Error('useAuth from lib/hooks/useAuth.tsx is disabled. Use useAuth from lib/contexts/AuthContext.js instead.');
}

export function AuthProvider() {
  throw new Error('AuthProvider from lib/hooks/useAuth.tsx is disabled. Use AuthProvider from lib/contexts/AuthContext.js instead.');
}

// All NextAuth-based code has been disabled to prevent conflicts with custom JWT authentication
