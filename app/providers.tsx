'use client';

import React, { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../lib/hooks/useAuth';

// Add explicit options to SessionProvider for better stability

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SessionProvider
      // Add explicit configuration to improve stability
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true}
    >
      <AuthProvider isClient={isClient}>{children}</AuthProvider>
    </SessionProvider>
  );
}
