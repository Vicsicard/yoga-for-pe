# Authentication and Database System Documentation

## Overview

This document provides a comprehensive guide to the authentication and database system used in the Yoga for PE Next.js application. The system uses a custom JWT-based authentication approach integrated with MongoDB for data storage and Stripe for subscription management.

## Database Connection

### Standardized Connection Module

The application uses a standardized database connection module located at `lib/db/index.js`. This module provides:

- A consistent way to connect to MongoDB across the application
- Connection caching to prevent multiple connections during development hot reloads
- Mock data support for development when MongoDB is unavailable
- Runtime environment checks to prevent client-side imports

### Usage

```javascript
import { connectDB } from '../lib/db/index';

// In an async function
await connectDB();
// Now you can use mongoose models
```

## Authentication System

### Overview

The authentication system uses custom JWT (JSON Web Token) tokens for user authentication. The main components are:

1. `auth.js` - Core authentication utilities
2. `lib/contexts/AuthContext.js` - React context for client-side authentication
3. `app/api/auth/*` - API routes for authentication operations

### JWT Token Structure

The JWT tokens contain the following information:

```json
{
  "userId": "[MongoDB ObjectId]",
  "email": "[User email]",
  "name": "[User name]",
  "subscription": {
    "status": "[active/inactive]",
    "plan": "[bronze/silver/gold]",
    "stripeCustomerId": "[Stripe customer ID]",
    "stripeSubscriptionId": "[Stripe subscription ID]",
    "currentPeriodEnd": "[Subscription end date]"
  },
  "iat": "[Issued at timestamp]",
  "exp": "[Expiration timestamp]"
}
```

### Authentication Flow

1. **Registration**:
   - User submits registration form
   - Server validates data and creates user in MongoDB
   - Password is hashed with bcrypt
   - JWT token is generated and returned to client
   - Token is stored in localStorage

2. **Login**:
   - User submits login form
   - Server validates credentials against MongoDB
   - JWT token is generated and returned to client
   - Token is stored in localStorage

3. **Session Verification**:
   - Client sends JWT token in Authorization header
   - Server verifies token signature and expiration
   - User data is fetched from MongoDB to ensure it's current
   - Updated user data is returned to client

4. **Logout**:
   - Token is removed from localStorage
   - Client state is reset

## User Model

The User model (`lib/models/User.js`) includes:

- Basic user information (name, email)
- Hashed password (using bcrypt)
- Subscription details
  - Status (active/inactive)
  - Plan (bronze/silver/gold)
  - Stripe customer ID
  - Stripe subscription ID
  - Current period end date

## Subscription System

The subscription system integrates with Stripe to manage user subscriptions:

### Subscription Tiers

- **Bronze**: Free tier with limited access
- **Silver**: $7.99/month with standard access
- **Gold**: $9.99/month with premium access

### Stripe Integration

- Checkout sessions for new subscriptions
- Customer portal for managing existing subscriptions
- Webhooks for subscription status updates

## API Routes

### Authentication Routes

- `/api/auth/signup` - Register new user
- `/api/auth/signin` - Login existing user
- `/api/auth/session` - Verify and refresh session
- `/api/auth/logout` - End user session

### Stripe Routes

- `/api/stripe/create-checkout-session` - Create new subscription
- `/api/stripe/create-portal-session` - Manage existing subscription
- `/api/stripe/webhooks` - Handle Stripe events
- `/api/subscription/verify-payment` - Verify subscription payment

### Debug Routes

- `/api/debug/auth-test` - Test authentication system
- `/debug/auth-test` - Visual interface for testing authentication

## Security Considerations

1. **Server-side Only Modules**:
   - Database and authentication modules enforce Node.js runtime
   - Client-side imports are prevented

2. **JWT Security**:
   - Tokens are signed with a secure secret
   - Short expiration time (7 days)
   - Tokens can be invalidated by changing the JWT_SECRET

3. **Password Security**:
   - Passwords are hashed with bcrypt
   - Passwords are never returned to the client

## Environment Variables

The following environment variables are required:

```
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/
JWT_SECRET=[your_jwt_secret]
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SILVER_PRICE_ID=price_...
STRIPE_GOLD_PRICE_ID=price_...
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify that the MONGODB_URI environment variable is correctly set
2. Check MongoDB Atlas dashboard for connection issues
3. Ensure IP whitelist includes your development and production servers

### Authentication Issues

If users experience authentication problems:

1. Check browser console for JWT-related errors
2. Verify that the JWT_SECRET environment variable is correctly set
3. Clear localStorage and try logging in again

### Subscription Issues

For subscription-related problems:

1. Check Stripe dashboard for subscription status
2. Verify webhook delivery in Stripe dashboard
3. Check that STRIPE environment variables are correctly set
