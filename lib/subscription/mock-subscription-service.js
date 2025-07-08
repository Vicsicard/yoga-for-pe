// Mock subscription service implementation
import { SubscriptionTier } from '../vimeo-browser';
import { SubscriptionService } from './subscription-service';
import { SubscriptionStatus, createSubscriptionData, createCheckoutSessionData, createSubscriptionPlan } from './types';

// Mock database of user subscriptions
const mockSubscriptions = {};

// Mock subscription plans
const mockSubscriptionPlans = [
  {
    id: 'bronze',
    tier: SubscriptionTier.BRONZE,
    name: 'Bronze',
    description: 'Free access to select videos',
    price: 0,
    priceId: 'price_bronze_free',
    features: [
      { title: 'Access to free videos', included: true },
      { title: 'Basic meditation content', included: true },
      { title: 'Silver tier content', included: false },
      { title: 'Gold tier content', included: false }
    ]
  },
  {
    id: 'silver',
    tier: SubscriptionTier.SILVER,
    name: 'Silver',
    description: 'Access to most videos',
    price: 9.99,
    priceId: 'price_silver_monthly',
    features: [
      { title: 'Access to free videos', included: true },
      { title: 'Basic meditation content', included: true },
      { title: 'Silver tier content', included: true },
      { title: 'Gold tier content', included: false }
    ]
  },
  {
    id: 'gold',
    tier: SubscriptionTier.GOLD,
    name: 'Gold',
    description: 'Access to all videos',
    price: 19.99,
    priceId: 'price_gold_monthly',
    features: [
      { title: 'Access to free videos', included: true },
      { title: 'Basic meditation content', included: true },
      { title: 'Silver tier content', included: true },
      { title: 'Gold tier content', included: true }
    ]
  }
];

export class MockSubscriptionService {
  async createCheckoutSession(userId, tier) {
    console.log(`Creating mock checkout session for user ${userId} with tier ${tier}`);
    
    // Find the plan for the requested tier
    const plan = mockSubscriptionPlans.find(p => p.tier === tier);
    if (!plan) {
      throw new Error(`No plan found for tier ${tier}`);
    }
    
    // Create a mock session ID
    const sessionId = `mock_session_${Date.now()}_${userId}_${tier}`;
    
    // Return checkout session data
    return {
      sessionId,
      url: `/api/mock-checkout/success?session_id=${sessionId}&tier=${tier}&user_id=${userId}`
    };
  }
  
  async handleCheckoutSuccess(sessionId, userId) {
    console.log(`Processing successful checkout for session ${sessionId} and user ${userId}`);
    
    // Extract tier from session ID
    const tierMatch = sessionId.match(/mock_session_\d+_\w+_(BRONZE|SILVER|GOLD)/i);
    const tier = tierMatch ? tierMatch[1].toUpperCase() : SubscriptionTier.BRONZE;
    
    // Create subscription record
    const subscriptionId = `mock_sub_${Date.now()}_${userId}`;
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
    
    const subscription = {
      id: subscriptionId,
      userId,
      tier,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: endDate,
      createdAt: now,
      updatedAt: now
    };
    
    // Store in mock database
    if (!mockSubscriptions[userId]) {
      mockSubscriptions[userId] = [];
    }
    mockSubscriptions[userId].push(subscription);
    
    return subscription;
  }
  
  async getSubscription(userId) {
    console.log(`Getting subscription for user ${userId}`);
    
    // Get the user's subscriptions
    const userSubscriptions = mockSubscriptions[userId] || [];
    
    // Find active subscription
    const activeSubscription = userSubscriptions.find(sub => 
      sub.status === SubscriptionStatus.ACTIVE && 
      sub.currentPeriodEnd > new Date()
    );
    
    return activeSubscription || null;
  }
  
  async getSubscriptionPlans() {
    return mockSubscriptionPlans;
  }
  
  async cancelSubscription(subscriptionId) {
    console.log(`Cancelling subscription ${subscriptionId}`);
    
    // Find the subscription
    let foundSubscription = null;
    
    Object.keys(mockSubscriptions).forEach(userId => {
      mockSubscriptions[userId].forEach(sub => {
        if (sub.id === subscriptionId) {
          sub.status = SubscriptionStatus.CANCELED;
          sub.updatedAt = new Date();
          foundSubscription = sub;
        }
      });
    });
    
    return foundSubscription;
  }
}
