'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/contexts/AuthContext';

const PricingCard = ({ title, price, features, tier, isPopular, onSelect, isLoading }) => {
  return (
    <div className={`flex flex-col p-6 mx-auto max-w-lg text-center rounded-lg border ${
      isPopular ? 'border-primary shadow-md' : 'border-gray-200'
    } xl:p-8 ${isPopular ? 'bg-primary/5' : 'bg-white'}`}>
      {isPopular && (
        <div className="mb-4 py-1 px-4 bg-primary text-white text-xs font-semibold rounded-full inline-block mx-auto">
          Most Popular
        </div>
      )}
      <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
      <div className="flex justify-center items-baseline my-8">
        <span className="mr-2 text-5xl font-extrabold">${price}</span>
        <span className="text-gray-500">/month</span>
      </div>
      <ul role="list" className="mb-8 space-y-4 text-left">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-3">
            <svg 
              className="flex-shrink-0 w-5 h-5 text-green-500" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd"
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(tier)}
        disabled={isLoading}
        className={`w-full py-3 px-4 font-medium rounded-lg ${
          isPopular 
            ? 'bg-primary hover:bg-primary-dark text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        } transition-colors duration-200 focus:ring-4 focus:ring-primary/30 disabled:opacity-70`}
      >
        {isLoading ? 'Processing...' : 'Get Started'}
      </button>
    </div>
  );
};

export default function SubscriptionPlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPlan = async (tier) => {
    setIsLoading(true);
    setError('');

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Please sign in to subscribe to a plan');
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

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Define subscription plans
  const plans = [
    {
      title: 'Bronze',
      price: '0',
      features: [
        'Access to free videos',
        'Basic yoga tutorials',
        'Limited content access',
        'No premium features',
      ],
      tier: 'bronze',
      isPopular: false,
    },
    {
      title: 'Silver',
      price: '7.99',
      features: [
        'All Bronze features',
        'Access to all silver videos',
        'Downloadable resources',
        'Email support',
      ],
      tier: 'silver',
      isPopular: true,
    },
    {
      title: 'Gold',
      price: '9.99',
      features: [
        'All Silver features',
        'Access to ALL videos',
        'Live Q&A sessions',
        'Priority support',
        'Early access to new content',
      ],
      tier: 'gold',
      isPopular: false,
    },
  ];

  // Check current subscription
  const currentPlan = user?.subscription?.plan || 'bronze';
  const isSubscriptionActive = user?.subscription?.status === 'active';

  return (
    <section className="bg-white">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h1 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">
            Choose Your Subscription Plan
          </h1>
          <p className="mb-5 font-light text-gray-500 sm:text-xl">
            Get access to premium yoga content for physical education with our flexible subscription options.
          </p>
          {error && (
            <div className="p-4 mb-5 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}
          {isSubscriptionActive && (
            <div className="p-4 mb-5 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
              You currently have an active <strong className="font-medium">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong> subscription.
            </div>
          )}
        </div>
        <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
          {plans.map((plan) => (
            <PricingCard
              key={plan.tier}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              tier={plan.tier}
              isPopular={plan.isPopular}
              onSelect={handleSelectPlan}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
