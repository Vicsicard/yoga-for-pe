'use client';

import { useState } from 'react';

export default function TestAuth() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSignin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing signin with:', { email, password });
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Signin response status:', response.status);
      const data = await response.json();
      console.log('Signin response data:', data);
      
      if (response.ok && data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        
        // Also store in cookie for middleware
        document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
        
        setResult(`SUCCESS: Token received and stored\n\nUser: ${JSON.stringify(data.user, null, 2)}\n\nToken (first 20 chars): ${data.token.substring(0, 20)}...`);
      } else {
        setResult(`ERROR: ${response.status} - ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error('Signin test error:', error);
      setResult(`NETWORK ERROR: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testSession = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setResult('ERROR: No token found in localStorage');
        setLoading(false);
        return;
      }
      
      console.log('Testing session with token (first 20 chars):', token.substring(0, 20) + '...');

      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Session check response status:', response.status);
      const data = await response.json();
      console.log('Session check response data:', data);
      
      if (response.ok && data.success) {
        setResult(`SESSION VALID\n\nUser: ${JSON.stringify(data.user, null, 2)}`);
      } else {
        // If session is invalid, clear tokens
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        
        setResult(`SESSION ERROR: ${response.status}\n\nDetails: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error('Session test error:', error);
      setResult(`SESSION NETWORK ERROR: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={testSignin}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Signin'}
        </button>
        
        <button
          onClick={testSession}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Session'}
        </button>
      </div>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-medium mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">{result}</pre>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Test User:</strong> test@example.com</p>
        <p><strong>Password:</strong> password123</p>
      </div>
    </div>
  );
}
