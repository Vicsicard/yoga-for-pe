# Implementation Plan: Clerk Authentication + Stripe Payment Integration

## Prerequisites
- **Client must set up their own Stripe account for Yoga for PE first** (not use personal Stripe account)
- Existing Clerk authentication is already configured

## Phase 1: Setup & Configuration

### 1. Set up a new Stripe account for Yoga for PE
- Create a dedicated business account at [stripe.com](https://stripe.com)
- Complete business verification and banking information
- Set up webhook endpoints for your development and production environments

### 2. Configure Stripe Products and Pricing
- Create two subscription products:
  - Silver Tier ($7.99/month)
  - Gold Tier ($9.99/month)
- Configure metadata for each product to identify subscription tiers
- Set up appropriate billing cycles and trial periods if desired

### 3. Install Stripe SDK
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

### 4. Set up environment variables
```
# Add to .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Phase 2: Backend Implementation

### 5. Create Stripe API Routes
- Create `/app/api/stripe/create-checkout-session.ts` for initiating checkout
- Create `/app/api/stripe/webhook.ts` for handling subscription events
- Create `/app/api/stripe/customer-portal.ts` for managing subscriptions

### 6. Create Database Schema for Subscriptions
- Add subscription fields to user model:
  - `stripeCustomerId`
  - `subscriptionId`
  - `subscriptionStatus`
  - `subscriptionTier`
  - `subscriptionPeriodEnd`

### 7. Implement Webhook Handler
- Process `checkout.session.completed` events
- Process `customer.subscription.updated` events
- Process `customer.subscription.deleted` events
- Update user subscription status in database

## Phase 3: Frontend Implementation

### 8. Enhance Premium Content Modal
- Update `/components/PremiumModal.tsx` to include:
  - Authentication state check
  - Sign-in/Sign-up options via Clerk
  - Subscription tier selection after authentication

### 9. Create Subscription Components
- Create `/components/SubscriptionTiers.tsx` to display tier options
- Create `/components/SubscriptionBenefits.tsx` to show tier benefits
- Create `/components/SubscriptionManagement.tsx` for managing existing subscriptions

### 10. Update Access Control Logic
- Modify `hasAccessToVideo` in `lib/vimeo-browser.ts` to:
  - Check user authentication status via Clerk
  - Query database for subscription tier
  - Compare video tier against user subscription tier

### 11. Create User Dashboard
- Create `/app/dashboard/page.tsx` for subscription management
- Add subscription status display
- Add payment history
- Add upgrade/downgrade options
- Add cancellation flow

## Phase 4: Integration & Testing

### 12. Connect Authentication with Payment Flow
- After successful Clerk authentication, redirect to subscription selection
- After subscription selection, redirect to Stripe Checkout
- After successful payment, update user status and redirect to content

### 13. Test Full User Journey
- Test free content access
- Test premium content access denial for free users
- Test sign-up flow
- Test payment flow with test cards
- Test subscription status updates
- Test access to appropriate content after subscription

### 14. Implement Error Handling
- Handle payment failures
- Handle webhook failures
- Implement retry mechanisms
- Add monitoring and alerts

## Phase 5: Deployment & Monitoring

### 15. Deploy to Production
- Update environment variables for production
- Configure production webhook endpoints
- Test end-to-end flow in production environment

### 16. Set up Monitoring
- Monitor subscription events
- Track conversion rates
- Monitor for payment failures
- Set up alerts for critical failures

## Timeline Estimate
- Phase 1: 1-2 days
- Phase 2: 3-4 days
- Phase 3: 4-5 days
- Phase 4: 2-3 days
- Phase 5: 1-2 days

Total estimated time: 11-16 days

## User Flow Diagram

1. User browses free (Bronze) videos
2. User clicks on premium (Silver/Gold) video
3. Premium content modal appears
4. User is prompted to sign in or create account with Clerk
5. After authentication, user sees subscription tier options
6. User selects tier and proceeds to Stripe Checkout
7. After successful payment, Stripe webhook updates user's subscription status
8. User is redirected back to video with new access privileges
