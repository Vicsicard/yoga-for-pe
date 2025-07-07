'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';

export default function DebugPage() {
  const { user, isAuthenticated } = useAuth();
  const [envVars, setEnvVars] = useState({});
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [stripeStatus, setStripeStatus] = useState('Checking...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check environment variables
    const checkEnv = async () => {
      try {
        const response = await fetch('/api/debug/env');
        const data = await response.json();
        setEnvVars(data);
      } catch (err) {
        console.error('Failed to check environment variables:', err);
        setEnvVars({ error: err.message });
      }
    };

    // Check database connection
    const checkDb = async () => {
      try {
        const response = await fetch('/api/debug/db');
        const data = await response.json();
        setDbStatus(data.connected ? 'Connected' : 'Disconnected');
      } catch (err) {
        console.error('Failed to check database connection:', err);
        setDbStatus(`Error: ${err.message}`);
      }
    };

    // Check auth status
    const checkAuth = async () => {
      try {
        setAuthStatus(isAuthenticated ? 'Authenticated' : 'Not authenticated');
      } catch (err) {
        console.error('Failed to check auth status:', err);
        setAuthStatus(`Error: ${err.message}`);
      }
    };

    // Check Stripe status
    const checkStripe = async () => {
      try {
        const response = await fetch('/api/debug/stripe');
        const data = await response.json();
        setStripeStatus(data.configured ? 'Configured' : 'Not configured');
      } catch (err) {
        console.error('Failed to check Stripe status:', err);
        setStripeStatus(`Error: ${err.message}`);
      }
    };

    // Intentionally trigger an error to test error boundary
    const triggerError = () => {
      try {
        throw new Error('This is a test error');
      } catch (err) {
        setError(err.message);
      }
    };

    checkEnv();
    checkDb();
    checkAuth();
    checkStripe();
  }, [isAuthenticated]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Database Connection:</p>
              <p className={`mt-1 ${dbStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                {dbStatus}
              </p>
            </div>
            
            <div>
              <p className="font-medium">Authentication Status:</p>
              <p className={`mt-1 ${authStatus === 'Authenticated' ? 'text-green-600' : 'text-yellow-600'}`}>
                {authStatus}
              </p>
            </div>
            
            <div>
              <p className="font-medium">Stripe Status:</p>
              <p className={`mt-1 ${stripeStatus === 'Configured' ? 'text-green-600' : 'text-yellow-600'}`}>
                {stripeStatus}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          
          {isAuthenticated ? (
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {user?.id}</p>
              <p><span className="font-medium">Name:</span> {user?.name}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Subscription Plan:</span> {user?.subscription?.plan || 'None'}</p>
              <p><span className="font-medium">Subscription Status:</span> {user?.subscription?.status || 'None'}</p>
              {user?.subscription?.currentPeriodEnd && (
                <p>
                  <span className="font-medium">Current Period End:</span>{' '}
                  {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-yellow-600">Not authenticated</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(envVars).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof value === 'boolean' ? (
                        value ? (
                          <span className="text-green-600">Set</span>
                        ) : (
                          <span className="text-red-600">Not set</span>
                        )
                      ) : (
                        value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Error Testing</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={() => {
                throw new Error('Intentional test error');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Trigger Error
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Click this button to test the error boundary component
            </p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Error caught:</p>
              <p className="mt-1">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
