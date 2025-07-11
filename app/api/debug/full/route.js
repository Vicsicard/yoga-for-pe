import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

// Prevent this route from being statically generated
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const debugInfo = {
    environment: {},
    auth: {},
    stripe: {},
    mongodb: {},
    request: {}
  };

  // Check environment variables
  const envVars = [
    'JWT_SECRET',
    'MONGODB_URI',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_SILVER_PRICE_ID',
    'STRIPE_GOLD_PRICE_ID',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_BASE_URL'
  ];

  debugInfo.environment.variables = {};
  envVars.forEach(varName => {
    const value = process.env[varName];
    debugInfo.environment.variables[varName] = {
      exists: !!value,
      value: varName.includes('SECRET') || varName.includes('KEY') 
        ? (value ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : null)
        : value
    };
  });

  // Check authorization header
  const authHeader = request.headers.get('Authorization');
  debugInfo.auth.headerPresent = !!authHeader;
  debugInfo.auth.headerValue = authHeader ? `${authHeader.substring(0, 15)}...` : null;

  // Check JWT token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    debugInfo.auth.tokenExtracted = true;
    
    try {
      if (!process.env.JWT_SECRET) {
        debugInfo.auth.jwtSecretMissing = true;
      } else {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        debugInfo.auth.tokenValid = true;
        debugInfo.auth.tokenDecoded = {
          userId: decoded.userId,
          email: decoded.email,
          exp: decoded.exp,
          iat: decoded.iat
        };
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        debugInfo.auth.tokenExpired = decoded.exp < now;
      }
    } catch (error) {
      debugInfo.auth.tokenValid = false;
      debugInfo.auth.tokenError = error.message;
    }
  }

  // Check MongoDB connection
  try {
    if (!process.env.MONGODB_URI) {
      debugInfo.mongodb.uriMissing = true;
    } else {
      const { db } = await connectToDatabase();
      const collections = await db.listCollections().toArray();
      debugInfo.mongodb.connected = true;
      debugInfo.mongodb.collections = collections.map(c => c.name);
      
      // Check if users collection exists and try to find user
      if (debugInfo.auth.tokenValid && debugInfo.auth.tokenDecoded) {
        const userId = debugInfo.auth.tokenDecoded.userId;
        const user = await db.collection('users').findOne({ _id: userId });
        debugInfo.mongodb.userFound = !!user;
        if (user) {
          debugInfo.mongodb.userDetails = {
            email: user.email,
            hasSubscription: !!user.subscription,
            subscriptionTier: user.subscription?.tier || null
          };
        }
      }
    }
  } catch (error) {
    debugInfo.mongodb.connected = false;
    debugInfo.mongodb.error = error.message;
  }

  // Check Stripe configuration
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      debugInfo.stripe.secretKeyMissing = true;
    } else {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      // Check account
      const account = await stripe.account.retrieve();
      debugInfo.stripe.connected = true;
      debugInfo.stripe.account = {
        id: account.id,
        name: account.business_profile?.name || 'Not set',
        email: account.email,
        country: account.country,
        chargesEnabled: account.charges_enabled
      };
      
      // Check price IDs
      if (process.env.STRIPE_SILVER_PRICE_ID) {
        try {
          const silverPrice = await stripe.prices.retrieve(process.env.STRIPE_SILVER_PRICE_ID);
          debugInfo.stripe.silverPriceValid = true;
          debugInfo.stripe.silverPriceDetails = {
            id: silverPrice.id,
            amount: silverPrice.unit_amount / 100,
            currency: silverPrice.currency,
            interval: silverPrice.recurring?.interval || 'one-time'
          };
        } catch (error) {
          debugInfo.stripe.silverPriceValid = false;
          debugInfo.stripe.silverPriceError = error.message;
        }
      }
      
      if (process.env.STRIPE_GOLD_PRICE_ID) {
        try {
          const goldPrice = await stripe.prices.retrieve(process.env.STRIPE_GOLD_PRICE_ID);
          debugInfo.stripe.goldPriceValid = true;
          debugInfo.stripe.goldPriceDetails = {
            id: goldPrice.id,
            amount: goldPrice.unit_amount / 100,
            currency: goldPrice.currency,
            interval: goldPrice.recurring?.interval || 'one-time'
          };
        } catch (error) {
          debugInfo.stripe.goldPriceValid = false;
          debugInfo.stripe.goldPriceError = error.message;
        }
      }
    }
  } catch (error) {
    debugInfo.stripe.connected = false;
    debugInfo.stripe.error = error.message;
  }

  // Return all debug info
  return NextResponse.json(debugInfo);
}
