'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/hooks/useAuth';

export default function PremiumContentModal({ isOpen, onClose, contentTitle }) {
  const { user, isAuthenticated, createSubscription } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle subscription button click
  const handleSubscribe = async (tier) => {
    setIsLoading(true);
    setError('');

    try {
      if (!isAuthenticated) {
        // Redirect to sign-in if not authenticated
        router.push(`/sign-in?redirect=${encodeURIComponent('/subscription/plans')}`);
        return;
      }

      // Create checkout session
      const result = await createSubscription(tier);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create subscription');
      }
      
      // Redirect to Stripe checkout
      window.location.href = result.url;
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-primary p-4">
          <h3 className="text-xl font-bold text-white">Premium Content</h3>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">
              {contentTitle || 'This content requires a premium subscription'}
            </h4>
            <p className="text-gray-600">
              Unlock our complete library of yoga videos for physical education with a premium subscription.
            </p>
          </div>
          
          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold">Silver Plan</h5>
                <span className="text-lg font-bold">$7.99/mo</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Access to all silver videos and downloadable resources.
              </p>
              <button
                onClick={() => handleSubscribe('silver')}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors disabled:opacity-70"
              >
                {isLoading ? 'Processing...' : 'Subscribe to Silver'}
              </button>
            </div>
            
            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <h5 className="font-semibold">Gold Plan</h5>
                  <span className="ml-2 py-1 px-2 bg-yellow-400 text-xs font-semibold rounded-full">
                    BEST VALUE
                  </span>
                </div>
                <span className="text-lg font-bold">$9.99/mo</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Access to ALL videos, live Q&A sessions, and priority support.
              </p>
              <button
                onClick={() => handleSubscribe('gold')}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors disabled:opacity-70"
              >
                {isLoading ? 'Processing...' : 'Subscribe to Gold'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
