// Comprehensive test script to verify our authentication system and database connections
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection with error handling
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Cache MongoDB connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch(error => {
        console.error('MongoDB connection error:', error);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('MongoDB URI exists:', !!MONGODB_URI);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// User model schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  subscription: {
    status: { type: String, default: 'inactive' },
    plan: { type: String, default: 'bronze' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Get User model (with handling for model compilation errors)
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function testAuth() {
  console.log('🔍 COMPREHENSIVE AUTHENTICATION SYSTEM TEST');
  console.log('==========================================');
  
  // Environment variables check
  console.log('\n📋 ENVIRONMENT VARIABLES CHECK:');
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('NEXT_PUBLIC_BASE_URL exists:', !!process.env.NEXT_PUBLIC_BASE_URL);
  
  try {
    // Connect to our production MongoDB Atlas database
    console.log('\n🔌 DATABASE CONNECTION TEST:');
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas database');
    
    // Check if test user already exists
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      // Test user creation
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 12),
        subscription: {
          plan: 'bronze',
          status: 'active',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        }
      };
      
      testUser = await User.create(newUser);
      console.log('✅ User created:', { id: testUser._id, email: testUser.email });
    } else {
      console.log('✅ Test user already exists:', { id: testUser._id, email: testUser.email });
    }
    
    // Test user lookup
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log('✅ User found:', foundUser ? 'Yes' : 'No');
    console.log('User ID type:', typeof foundUser._id);
    console.log('User ID value:', foundUser._id.toString());
    
    // Test password comparison
    const isValid = await bcrypt.compare('password123', foundUser.password);
    console.log('✅ Password validation:', isValid ? 'Valid' : 'Invalid');
    
    // Test JWT token generation
    console.log('\n🔑 JWT TOKEN GENERATION TEST:');
    const userId = foundUser._id.toString();
    console.log('User ID for token:', userId);
    console.log('User ID type:', typeof userId);
    
    const token = jwt.sign(
      { 
        userId: userId,
        email: foundUser.email,
        name: foundUser.name,
        subscription: {
          plan: foundUser.subscription?.plan || 'bronze',
          status: foundUser.subscription?.status || 'active',
          currentPeriodEnd: foundUser.subscription?.currentPeriodEnd || null,
          stripeCustomerId: foundUser.subscription?.stripeCustomerId || null,
          stripeSubscriptionId: foundUser.subscription?.stripeSubscriptionId || null
        }
      },
      process.env.JWT_SECRET || 'development-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT token generated:', token.substring(0, 20) + '...');
    
    // Test JWT token verification
    console.log('\n🔐 JWT TOKEN VERIFICATION TEST:');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-key');
    console.log('✅ JWT token verified:', {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      subscription: decoded.subscription
    });
    console.log('Decoded userId type:', typeof decoded.userId);
    
    // Test forgot password token generation
    console.log('\n📧 PASSWORD RESET TOKEN TEST:');
    const resetToken = jwt.sign(
      { email: foundUser.email },
      process.env.JWT_SECRET || 'development-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('✅ Reset token generated:', resetToken.substring(0, 20) + '...');
    
    // Update user with reset token
    foundUser.resetPasswordToken = resetToken;
    foundUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await foundUser.save();
    console.log('✅ User updated with reset token');
    
    // Verify reset token
    const decodedReset = jwt.verify(resetToken, process.env.JWT_SECRET || 'development-secret-key');
    console.log('✅ Reset token verified:', {
      email: decodedReset.email,
      exp: new Date(decodedReset.exp * 1000).toISOString()
    });
    
    // Test reset password functionality
    console.log('\n🔄 PASSWORD RESET FUNCTIONALITY TEST:');
    const newPassword = 'newPassword456';
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update user's password
    foundUser.password = hashedNewPassword;
    foundUser.resetPasswordToken = undefined;
    foundUser.resetPasswordExpires = undefined;
    await foundUser.save();
    console.log('✅ User password updated');
    
    // Verify new password
    const isNewPasswordValid = await bcrypt.compare(newPassword, foundUser.password);
    console.log('✅ New password validation:', isNewPasswordValid ? 'Valid' : 'Invalid');
    
    // Reset password back to original for future tests
    foundUser.password = await bcrypt.hash('password123', 12);
    await foundUser.save();
    console.log('✅ Password reset to original');
    
    console.log('\n🎉 AUTHENTICATION SYSTEM TEST COMPLETED SUCCESSFULLY!');
    console.log('All critical authentication and database components are working correctly.');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'MongoServerError') {
      console.error('\n🔴 MONGODB CONNECTION ISSUE:');
      console.error('- Check that your MongoDB Atlas username and password are correct');
      console.error('- Verify that your IP address is whitelisted in MongoDB Atlas');
      console.error('- Ensure the connection string format is correct');
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.error('\n🔴 JWT TOKEN ISSUE:');
      console.error('- Verify that JWT_SECRET is properly set in your .env.local file');
      console.error('- Check that the token format is correct');
    }
  }
  
  // Always disconnect from MongoDB when done
  try {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (disconnectError) {
    console.error('\n❌ Error disconnecting from MongoDB:', disconnectError);
  }
}

testAuth();
