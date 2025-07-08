'use client'

import { SubscriptionTier } from '../lib/vimeo-browser'



export default function SubscriptionCTA({ onSubscribeClick }) {
  return (
    <section className="bg-primary-50 py-16">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Unlock Premium Content</h2>
          <p className="text-lg text-gray-700 mb-8">
            Subscribe to access our complete library of premium videos, curriculum materials, and exclusive resources for yoga in physical education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              onClick={() => onSubscribeClick(SubscriptionTier.SILVER)}
            >
              View Subscription Plans
            </button>
            <button className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
