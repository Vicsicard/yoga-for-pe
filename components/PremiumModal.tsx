'use client'

import { SubscriptionTier, subscriptionTierDetails } from '../lib/vimeo-browser'

interface PremiumModalProps {
  selectedTier: SubscriptionTier | null;
  onClose: () => void;
}

export default function PremiumModal({ selectedTier, onClose }: PremiumModalProps) {
  if (!selectedTier) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold mb-4">
          {subscriptionTierDetails[selectedTier].name} Subscription Required
        </h3>
        <p className="mb-6">
          This video requires a {subscriptionTierDetails[selectedTier].name} subscription 
          (${subscriptionTierDetails[selectedTier].price.toFixed(2)}/month). 
          {subscriptionTierDetails[selectedTier].description}.
        </p>
        
        <div className="mb-6">
          <h4 className="font-bold mb-2">Subscription Options:</h4>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <span className="font-medium">{subscriptionTierDetails[SubscriptionTier.SILVER].name} Subscription</span>
                <p className="text-sm text-gray-600">{subscriptionTierDetails[SubscriptionTier.SILVER].description}</p>
              </div>
              <span className="font-bold">${subscriptionTierDetails[SubscriptionTier.SILVER].price.toFixed(2)}/mo</span>
            </div>
            <div className="p-3 border rounded-lg flex justify-between items-center bg-yellow-50">
              <div>
                <span className="font-medium">{subscriptionTierDetails[SubscriptionTier.GOLD].name} Subscription</span>
                <p className="text-sm text-gray-600">{subscriptionTierDetails[SubscriptionTier.GOLD].description}</p>
              </div>
              <span className="font-bold">${subscriptionTierDetails[SubscriptionTier.GOLD].price.toFixed(2)}/mo</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            onClick={() => {
              // Redirect to subscription page
              const tier = selectedTier === SubscriptionTier.SILVER ? 'silver' : 'gold';
              const subscriptionUrl = `/subscribe/${tier}`;
              
              // Open in a new tab
              window.open(subscriptionUrl, '_blank');
              onClose();
            }}
          >
            Subscribe Now
          </button>
          
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
