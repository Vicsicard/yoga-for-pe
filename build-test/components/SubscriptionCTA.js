'use client';

import React from 'react';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';

export default function SubscriptionCTA() {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-teal-400 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Unlock Premium Content</h2>
          <p className="text-white text-lg mb-8 opacity-90">
            Get unlimited access to all of our yoga, meditation, and mindfulness videos with a premium subscription.
          </p>
          
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Premium Benefits</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Unlimited access to all video content</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Downloadable lesson plans and resources</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-700">New videos added every week</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Teacher support and community access</span>
              </li>
            </ul>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/pricing" 
                className="bg-primary-500 hover:bg-primary-600 text-white py-3 px-8 rounded-lg font-semibold transition-colors text-center"
              >
                View Plans
              </Link>
              <Link 
                href="/sign-up" 
                className="border border-primary-500 text-primary-500 hover:bg-primary-50 py-3 px-8 rounded-lg font-semibold transition-colors text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
          
          <p className="text-white opacity-75">
            Already have an account? <Link href="/sign-in" className="underline font-medium">Sign in here</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
