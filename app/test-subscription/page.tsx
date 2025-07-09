'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/contexts/AuthContext';

export default function TestSubscriptionPage() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic page load effect
  useEffect(() => {
    console.log('Simple test subscription page loaded');
    setLoaded(true);
    
    // Send a log to the server for debugging
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test subscription page loaded client-side' })
    }).catch(err => console.error('Error sending log:', err));
  }, []);
  
  // Safe Clerk auth check
  let authStatus = 'Loading auth...';
  try {
    const { isLoaded, isSignedIn, userId } = useAuth();
    if (isLoaded) {
      authStatus = isSignedIn ? `Signed in (${userId})` : 'Not signed in';
    }
  } catch (err: any) {
    console.error('Auth error:', err);
    authStatus = `Auth error: ${err.message || 'Unknown'}`;
    setError(err.message || 'Authentication error');
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className="container mx-auto p-6 bg-red-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-xl mb-4">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-yellow-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Test Subscription Page - SIMPLIFIED</h1>
      <p className="text-xl mb-2">This is a simplified test subscription page to verify rendering.</p>
      <p className="text-xl mb-4">Check your browser console for log messages.</p>
      
      <div className="p-4 bg-green-200 rounded-lg mb-4">
        <p className="font-bold">Page loaded state: {loaded ? 'YES' : 'NO'}</p>
        <p>Current time: {new Date().toISOString()}</p>
      </div>
      
      <div className="p-4 bg-blue-200 rounded-lg">
        <p className="font-bold">Authentication Status: {authStatus}</p>
      </div>
    </div>
  );
}
