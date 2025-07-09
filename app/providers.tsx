'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '../lib/contexts/AuthContext';

// Using custom JWT authentication system (NextAuth disabled)

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only use our custom AuthProvider - NextAuth completely removed
  return (
    <AuthProvider>{children}</AuthProvider>
  );
}
