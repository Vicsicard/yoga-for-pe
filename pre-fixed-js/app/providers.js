'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../lib/hooks/useAuth";

// Add explicit options to SessionProvider for better stability

export function Providers({ children }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
