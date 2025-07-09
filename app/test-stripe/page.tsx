'use client';

import { useState } from 'react';

export default function TestStripe() {
  const [tier, setTier] = useState('silver');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testCreateCheckoutSession = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // First, get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setResult('ERROR: No auth token found. Please sign in first at /test-auth');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`SUCCESS: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`ERROR: ${response.status} - ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`NETWORK ERROR: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testStripeConfig = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/debug/stripe');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`STRIPE CONFIG: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`CONFIG ERROR: ${response.status} - ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`CONFIG NETWORK ERROR: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stripe Integration Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Subscription Tier:</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="silver">Silver ($7.99)</option>
            <option value="gold">Gold ($9.99)</option>
          </select>
        </div>
      </div>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={testStripeConfig}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Stripe Config'}
        </button>
        
        <button
          onClick={testCreateCheckoutSession}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Checkout Session'}
        </button>
      </div>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-medium mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">{result}</pre>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> You need to be signed in first. Go to <a href="/test-auth" className="text-blue-500 underline">/test-auth</a> to sign in.</p>
        <p><strong>Stripe Keys:</strong> Currently using placeholder values - need real Stripe test keys</p>
      </div>
    </div>
  );
}
