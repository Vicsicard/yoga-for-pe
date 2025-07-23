'use client';

import React, { useState, useEffect } from 'react';
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
          <li key={index} className="flex items-center">
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
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelectPlan = async (tier) => {
    setIsLoading(true);
    setError('');

    try {
      // Only run this code on the client side
      if (!isClient) {
        throw new Error('Client-side functionality not available during server rendering');
      }
      
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
        '--All Free Videos',
        '--Free Mindful Movements',
        '--As the website grows so will the free content'
      ],
      tier: 'bronze',
      isPopular: false,
    },
    {
      title: 'Silver',
      price: '7.99',
      features: [
        '--All Free Videos',
        '--Free Mindful Movements',
        '--All Yoga Flows',
        '--Supporting documents of how Yoga supports the SHAPE American National Standards',
        '--Monthly Blog/Vlog (coming soon)',
        '--As the website grows so will the free & Silver Content'
      ],
      tier: 'silver',
      isPopular: false,
    },
    {
      title: 'Gold',
      price: '9.99',
      features: [
        '--All Free Videos',
        '--Free Mindful Movements',
        '--All Yoga Flows',
        '--Supporting documents of how Yoga supports the SHAPE American National Standards',
        '--Monthly Blog/Vlog (coming soon)',
        '--Instructional Videos',
        '--Travel Videos done on location around the world',
        '--New Video(s) every month',
        '--Exclusive Gold only opportunities',
        '--As the website grows so will the Bronze (free), Silver, & Gold content'
      ],
      tier: 'gold',
      isPopular: true,
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
