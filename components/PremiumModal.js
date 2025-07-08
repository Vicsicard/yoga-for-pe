'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/hooks/useAuth';
import Link from 'next/link';
import { SubscriptionTier, subscriptionTierDetails } from '../lib/vimeo-browser';
import { SubscriptionPlan } from '../lib/subscription/types';

// Debug helper function
function logDebug(message, data) {
  console.log(`[PREMIUM-MODAL] ${message}`, data || '');
}



export default function PremiumModal({ selectedTier, onClose }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renderCount, setRenderCount] = useState(0);
  
  // Modal states
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [showSubscriptionOptions, setShowSubscriptionOptions] = useState(false);
  
  // Use our fixed auth logic safely
  let isSignedIn = false;
  let userId = null;
  
  try: {
    const: { user, isAuthenticated } = useAuth();
    isSignedIn = isAuthenticated;
    userId = user?.id || null;
  } catch (error) {
    console.error('Auth error in PremiumModal:', error);
    // Fall back to defaults set above
  }
  
  // Log on component mount only
  useEffect(() => {
    logDebug('PremiumModal mounted');
  }, []);
  
  // Track component renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    logDebug(`Component rendered ${renderCount + 1} times with tier: ${selectedTier ? SubscriptionTier[selectedTier] : 'none'}`);
  }, []);
  
  if (!selectedTier) {
    logDebug('No tier selected, not rendering modal');
    return null;
  }
  
  // Handle subscription checkout
  const handleSubscribe = async (tier) => {
    logDebug(`Handling subscription for tier: ${SubscriptionTier[tier]}`);
    
    if (!isSignedIn || !userId) {
      logDebug('User not signed in, showing auth options');
      setShowAuthOptions(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try: {
      logDebug('Creating checkout session', { tier=== SubscriptionTier.SILVER ? 'SILVER' : 'GOLD' });
      
      // Call API to create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier=== SubscriptionTier.SILVER ? 'SILVER' : 'GOLD',
        }),
      });
      
      logDebug('Checkout session response status:', response.status);
      const data = await response.json();
      logDebug('Checkout session response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }
      
      // Redirect to checkout URL
      if (data.url) {
        logDebug('Redirecting to checkout URL:', data.url);
        window.location.href = data.url;
      } else: {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      const errorMsg = `Error creating checkout session: ${err.message || 'Unknown error'}`;
      console.error('[PREMIUM-MODAL]', errorMsg, err);
      setError(errorMsg);
    } finally: {
      setIsLoading(false);
    }
  };
  
  // Handle authentication success
  const handleAuthSuccess = () => {
    logDebug('Auth success, showing subscription options');
    setShowAuthOptions(false);
    setShowSubscriptionOptions(true);
  };
  
  // Display any errors
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-2xl font-bold mb-4 text-red-600">Error
          <p className="mb-6 text-red-600">{error}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
            <button
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render authentication options
  if (showAuthOptions) {
    logDebug('Rendering auth options');
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-2xl font-bold mb-4">Sign in to Subscribe
          <p className="mb-6">
            Please sign in or create an account to access premium content.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="w-full">
              <Link href="/sign-in">
                <button 
                  className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={handleAuthSuccess}
                >
                  Sign In
                </button>
              </Link>
            </div>
            
            <div className="w-full">
              <Link href="/sign-up">
                <button 
                  className="w-full px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  onClick={handleAuthSuccess}
                >
                  Create Account
                </button>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render subscription options after authentication
  if (showSubscriptionOptions || isSignedIn) {
    logDebug('Rendering subscription options', { showSubscriptionOptions, isSignedIn });
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-2xl font-bold mb-4">Choose Your Subscription
          <p className="mb-6">
            Select a subscription plan to access premium content.
          </p>
          
          <div className="mb-6">
            <div className="space-y-3">
              <div 
                className={`p-4 border rounded-lg cursor-pointer hover:border-primary-600 transition-colors ${selectedTier === SubscriptionTier.SILVER ? 'border-primary-600 bg-primary-50' : ''}`}
                onClick={() => handleSubscribe(SubscriptionTier.SILVER)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-lg">{subscriptionTierDetails[SubscriptionTier.SILVER].name}</span>
                  <span className="font-bold">${subscriptionTierDetails[SubscriptionTier.SILVER].price.toFixed(2)}/mo
                </div>
                <p className="text-sm text-gray-600 mb-3">{subscriptionTierDetails[SubscriptionTier.SILVER].description}</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Access to all free videos
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Access to Silver tier content
                  </li>
                </ul>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer hover:border-primary-600 transition-colors ${selectedTier === SubscriptionTier.GOLD ? 'border-primary-600 bg-yellow-50' : ''}`}
                onClick={() => handleSubscribe(SubscriptionTier.GOLD)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-lg">{subscriptionTierDetails[SubscriptionTier.GOLD].name}</span>
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">BEST VALUE
                  </div>
                  <span className="font-bold">${subscriptionTierDetails[SubscriptionTier.GOLD].price.toFixed(2)}/mo
                </div>
                <p className="text-sm text-gray-600 mb-3">{subscriptionTierDetails[SubscriptionTier.GOLD].description}</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Access to all free videos
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Access to Silver tier content
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Access to exclusive Gold tier content
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Initial modal view
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold mb-4">
          {subscriptionTierDetails[selectedTier].name} Subscription Required
        </h3>
        <p className="mb-6">
          This video requires a: {subscriptionTierDetails[selectedTier].name} subscription 
          (${subscriptionTierDetails[selectedTier].price.toFixed(2)}/month). 
          {subscriptionTierDetails[selectedTier].description}
        </p>
        
        <div className="flex justify-between">
          <button
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            onClick={() => isSignedIn ? setShowSubscriptionOptions(true) : setShowAuthOptions(true)}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Subscribe Now'}
          </button>
          
          <button
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
