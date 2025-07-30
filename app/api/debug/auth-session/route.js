import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../../../lib/models/User';
import { connectDB } from '../../../../lib/db/index';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const debugInfo = {
    environment: {
      variables: {
        JWT_SECRET: {
          exists: !!process.env.JWT_SECRET,
          value: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 4)}...${process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 4)}` : null
        },
        MONGODB_URI: {
          exists: !!process.env.MONGODB_URI,
          value: process.env.MONGODB_URI || null
        }
      }
    },
    auth: {
      headerPresent: false,
      headerValue: null,
      tokenDecoded: null,
      tokenError: null
    },
    mongodb: {
      connected: false,
      connectionError: null,
      userModel: {
        exists: false,
        schema: null
      },
      collections: [],
      users: {
        count: 0,
        sample: null
      }
    },
    request: {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries([...request.headers.entries()].map(([key, value]) => 
        [key, key.toLowerCase() === 'authorization' ? 'REDACTED' : value]
      ))
    }
  };

  // Check auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    debugInfo.auth.headerPresent = true;
    debugInfo.auth.headerValue = `${authHeader.substring(0, 10)}...REDACTED`;
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      debugInfo.auth.tokenDecoded = {
        userId: decoded.userId,
        exp: decoded.exp,
        iat: decoded.iat
      };
    } catch (error) {
      debugInfo.auth.tokenError = {
        name: error.name,
        message: error.message
      };
    }
  }

  // Check MongoDB connection
  try {
    await connectDB();
    debugInfo.mongodb.connected = mongoose.connection.readyState === 1;
    
    // Get list of collections
    if (debugInfo.mongodb.connected) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      debugInfo.mongodb.collections = collections.map(c => c.name);
      
      // Check User model
      if (User) {
        debugInfo.mongodb.userModel.exists = true;
        debugInfo.mongodb.userModel.schema = Object.keys(User.schema.paths).reduce((acc, path) => {
          acc[path] = User.schema.paths[path].instance;
          return acc;
        }, {});
        
        // Count users
        try {
          const count = await User.countDocuments();
          debugInfo.mongodb.users.count = count;
          
          // Get sample user (first one)
          if (count > 0) {
            const user = await User.findOne({}).lean();
            if (user) {
              // Sanitize sensitive data
              const sanitizedUser = { ...user };
              if (sanitizedUser.password) sanitizedUser.password = 'REDACTED';
              if (sanitizedUser._id) sanitizedUser._id = sanitizedUser._id.toString();
              debugInfo.mongodb.users.sample = sanitizedUser;
            }
          }
        } catch (error) {
          debugInfo.mongodb.users.error = {
            name: error.name,
            message: error.message
          };
        }
      }
    }
  } catch (error) {
    debugInfo.mongodb.connectionError = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return NextResponse.json(debugInfo);
}
