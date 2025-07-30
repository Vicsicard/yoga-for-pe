# Yoga for PE - Next.js Application

A comprehensive web application for Yoga for Physical Education, featuring video content, subscription management, and user authentication.

## Features

- Video catalog with tiered access (Bronze, Silver, Gold)
- Custom JWT-based authentication system
- Stripe subscription integration
- MongoDB database integration
- Responsive design for all devices

## Authentication and Database System

### Authentication System

The application uses a custom JWT-based authentication system with the following features:

- **Token-based Authentication**: Secure JWT tokens with user data and subscription information
- **Role-based Access Control**: Content access based on subscription tier (Bronze, Silver, Gold)
- **Enhanced Error Handling**: Structured error responses with detailed error codes and messages
- **Security Features**: Server-side token verification, secure password hashing with bcrypt

### Database System

The application uses MongoDB for data storage with the following features:

- **Standardized Connection**: Centralized database connection module at `lib/db/index.js`
- **Connection Caching**: Prevents multiple connections during development hot reloads
- **Server-side Only**: Database modules enforce Node.js runtime to prevent client-side imports
- **Error Handling**: Comprehensive error handling for database operations

## API Routes

### Authentication Routes

- `/api/auth/login` - User login with email and password
- `/api/auth/register` - User registration
- `/api/auth/session` - Session verification and refresh

### Stripe Integration Routes

- `/api/stripe/create-checkout-session` - Create new subscription checkout
- `/api/stripe/create-portal-session` - Manage existing subscription
- `/api/stripe/webhooks` - Handle Stripe events
- `/api/subscription/verify-payment` - Verify subscription payment

### Debug Routes

- `/api/debug/auth-test` - Test authentication system
- `/debug/auth-test` - Visual interface for testing authentication

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

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB instance (local or Atlas)
- Stripe account with subscription products

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server: `npm run dev`

### Testing

To test the authentication system, visit `/debug/auth-test` after starting the development server.

## Documentation

Comprehensive documentation for the authentication and database system is available in the `docs/auth-db-system.md` file.
