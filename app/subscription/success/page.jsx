'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('Invalid session ID');
      setIsLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        // Verify the session with our backend
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to verify subscription');
        }

        const data = await response.json();
        setSubscription(data.subscription);
        
        // Refresh user data to get updated subscription status
        await refreshUser();
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError(err.message || 'Something went wrong. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [searchParams, refreshUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Subscription Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col space-y-4">
            <Link href="/subscription/plans" className="py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors">
              Return to Plans
            </Link>
            <Link href="/contact" className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to our {subscription?.tier || ''} plan. You now have access to premium content.
        </p>
        <div className="flex flex-col space-y-4">
          <Link href="/videos" className="py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors">
            Browse Videos
          </Link>
          <Link href="/account" className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors">
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}
