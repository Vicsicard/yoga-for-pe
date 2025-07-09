// Simple test script to verify our authentication system
import { connectDB, User } from './lib/db/dev-connect.js';
import bcrypt from 'bcryptjs';

async function testAuth() {
  console.log('Testing authentication system...');
  
  try {
    // Connect to our development store
    await connectDB();
    console.log('✅ Connected to development store');
    
    // Test user creation
    const testUser = {
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
    
    const createdUser = await User.create(testUser);
    console.log('✅ User created:', { id: createdUser._id, email: createdUser.email });
    
    // Test user lookup
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log('✅ User found:', foundUser ? 'Yes' : 'No');
    
    // Test password comparison
    const isValid = await bcrypt.compare('password123', foundUser.password);
    console.log('✅ Password validation:', isValid ? 'Valid' : 'Invalid');
    
    console.log('🎉 Authentication system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuth();
