'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/contexts/AuthContext';

const subscriptionTiers = {
  bronze: {
    name: "Bronze",
    price: 0,
    description: "Free forever",
    popular: false,
    features: [
      "Access to all Bronze (free) videos",
      "Basic yoga sequences for PE",
      "Foundational breathing exercises"
    ]
  },
  silver: {
    name: "Silver", 
    price: 7.99,
    description: "Perfect for regular practice",
    popular: true,
    features: [
      "Everything in Bronze",
      "Access to Silver premium videos",
      "Intermediate yoga sequences",
      "Specialized PE integration techniques",
      "Monthly new content"
    ]
  },
  gold: {
    name: "Gold",
    price: 9.99, 
    description: "Complete access",
    popular: false,
    features: [
      "Everything in Bronze & Silver",
      "Access to Gold exclusive videos", 
      "Advanced yoga sequences"
    ]
  }
};

const PricingCard = ({ tier, tierData, onSelect, isLoading }) => {
  const { name, price, description, popular, features } = tierData;
  
  return (
    <div className={`flex flex-col p-6 mx-auto max-w-lg text-center rounded-lg border ${
      popular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'
    } xl:p-8 ${popular ? 'bg-blue-50' : 'bg-white'} relative`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <h3 className="mb-4 text-2xl font-semibold text-gray-900">{name}</h3>
      
      <div className="flex justify-center items-baseline my-8">
        <span className="mr-2 text-5xl font-extrabold text-gray-900">
          ${price}
        </span>
        <span className="text-gray-500">
          {price === 0 ? '' : '/month'}
        </span>
      </div>
      
      <p className="font-light text-gray-500 sm:text-lg mb-8">{description}</p>
      
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
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onSelect(tier)}
        disabled={isLoading}
        className={`w-full py-3 px-4 font-medium rounded-lg transition-colors duration-200 focus:ring-4 focus:outline-none ${
          popular 
            ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300' 
            : price === 0
            ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300'
            : 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-300'
        } disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Processing...' : price === 0 ? 'Start Free' : 'Get Started'}
      </button>
    </div>
  );
};

export default function SubscriptionSelectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleTierSelection = async (tier) => {
    setIsLoading(true);
    setSelectedTier(tier);

    try {
      if (tier === 'bronze') {
        // Bronze is free - redirect to videos immediately
        router.push('/videos?welcome=true');
      } else {
        // For Silver/Gold, redirect to Stripe checkout
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
          body: JSON.stringify({
            tier: tier,
            userId: user?.id,
          }),
        });

        const data = await response.json();

        if (response.ok && data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      }
    } catch (error) {
      console.error('Subscription selection error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Welcome{user?.name ? `, ${user.name}` : ''}!
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose your Yoga for PE experience
          </p>
          <p className="mt-2 text-gray-500">
            Start with Bronze (free) or unlock premium content with Silver or Gold
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-3 sm:gap-6 lg:gap-8">
          {Object.entries(subscriptionTiers).map(([tier, tierData]) => (
            <PricingCard
              key={tier}
              tier={tier}
              tierData={tierData}
              onSelect={handleTierSelection}
              isLoading={isLoading && selectedTier === tier}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            You can upgrade or downgrade your subscription at any time.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            All subscriptions include a 30-day money-back guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}
