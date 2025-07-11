'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    // Only run if we have a session ID
    if (!sessionId) {
      setStatus('error');
      setError('No session ID found. Please try again.');
      return;
    }

    async function verifySubscriptionAndRefreshToken() {
      try {
        setStatus('verifying');
        
        // Get the current token from localStorage
        const token = localStorage.getItem('token');
        
        console.log('Verifying payment with session ID:', sessionId);
        console.log('Token available:', !!token);

        // Call our API to verify the subscription and refresh the token
        // The API can now handle cases where token is missing
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Add authorization header only if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/subscription/verify-payment', {
          method: 'POST',
          headers,
          body: JSON.stringify({ sessionId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to verify subscription');
        }

        const data = await response.json();
        console.log('Payment verification successful:', data);
        
        // Save the new token with updated subscription info
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('JWT token updated with new subscription info');
        }
        
        // Store subscription info for display
        if (data.subscription) {
          setSubscriptionInfo(data.subscription);
        }
        
        setStatus('success');
        
        // Auto-redirect to videos after 3 seconds
        setTimeout(() => {
          router.push('/videos');
        }, 3000);
        
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setStatus('error');
        setError(err.message || 'An error occurred while verifying your subscription');
      }
    }

    verifySubscriptionAndRefreshToken();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            {status === 'verifying' ? (
              <svg className="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : status === 'error' ? (
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {status === 'verifying' ? 'Verifying Payment...' : 
             status === 'error' ? 'Verification Failed' : 
             'Subscription Successful!'}
          </h1>
          
          <p className="mt-2 text-gray-600">
            {status === 'verifying' ? 'Please wait while we verify your payment and update your account.' :
             status === 'error' ? 'There was an issue verifying your payment.' :
             'Thank you for subscribing. Your payment has been processed successfully.'}
          </p>
          
          {status === 'success' && subscriptionInfo && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Plan:</strong> {subscriptionInfo.plan.charAt(0).toUpperCase() + subscriptionInfo.plan.slice(1)}
              </p>
              <p className="text-sm text-green-800">
                <strong>Status:</strong> {subscriptionInfo.status.charAt(0).toUpperCase() + subscriptionInfo.status.slice(1)}
              </p>
              {subscriptionInfo.currentPeriodEnd && (
                <p className="text-sm text-green-800">
                  <strong>Next billing:</strong> {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                Don't worry - your payment was processed. Your account will be updated shortly.
              </p>
            </div>
          )}
          
          {sessionId && (
            <p className="mt-2 text-sm text-gray-500">
              Session ID: {sessionId}
            </p>
          )}
          
          <div className="mt-6">
            {status === 'success' ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">Redirecting to videos in 3 seconds...</p>
                <Link
                  href="/videos"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Videos Now
                </Link>
              </div>
            ) : status === 'error' ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link
                    href="/videos"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Videos
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Login
                  </Link>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
