'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in?redirect=/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleManageSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert('Unable to access subscription management. Please try again.');
      }
    } catch (error) {
      console.error('Portal session error:', error);
      alert('Unable to access subscription management. Please try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getSubscriptionStatus = () => {
    const { status, plan } = user.subscription;
    
    if (status === 'active') {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: `Active - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`
      };
    } else if (status === 'past_due') {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        text: 'Payment Past Due'
      };
    } else if (status === 'canceled') {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: 'Canceled'
      };
    } else {
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        text: 'Bronze (Free)'
      };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Account Dashboard</h1>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>

            {/* User Info */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscriptionStatus.bgColor} ${subscriptionStatus.color}`}>
                        {subscriptionStatus.text}
                      </span>
                    </div>
                    {user.subscription.currentPeriodEnd && (
                      <p className="mt-2 text-sm text-gray-600">
                        {user.subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on{' '}
                        {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {user.subscription.status !== 'inactive' && (
                    <button
                      onClick={handleManageSubscription}
                      disabled={subscriptionLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {subscriptionLoading ? 'Loading...' : 'Manage Subscription'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/videos')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Browse Videos
                </button>
                
                {user.subscription.plan === 'bronze' && (
                  <button
                    onClick={() => router.push('/subscription/select')}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
