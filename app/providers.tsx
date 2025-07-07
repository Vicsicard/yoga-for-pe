'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../lib/hooks/useAuth';

// Add explicit options to SessionProvider for better stability

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Add explicit configuration to improve stability
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true}
    >
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
