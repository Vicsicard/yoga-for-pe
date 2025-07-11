'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestCheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleTestCheckout = async (tier) => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/stripe/test-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Error creating test checkout session:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Test Stripe Checkout</h1>
      <p className="mb-4">This is a simplified test page that bypasses authentication and MongoDB to test Stripe directly.</p>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => handleTestCheckout('silver')}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Test Silver Plan ($7.99)'}
        </button>
        
        <button
          onClick={() => handleTestCheckout('gold')}
          disabled={isLoading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Test Gold Plan ($9.99)'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-bold mb-2">API Response:</h3>
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8">
        <Link href="/subscription/plans" className="text-blue-500 hover:underline">
          Back to Regular Subscription Plans
        </Link>
      </div>
    </div>
  );
}
