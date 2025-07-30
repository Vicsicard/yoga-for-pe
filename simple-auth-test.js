// Simple authentication test script
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

console.log('🔍 SIMPLE AUTHENTICATION TEST');
console.log('============================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('NEXT_PUBLIC_BASE_URL exists:', !!process.env.NEXT_PUBLIC_BASE_URL);

// Test MongoDB connection
async function testConnection() {
  try {
    console.log('\n🔌 Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
    console.log('✅ MongoDB connected successfully!');
    
    // Test JWT token generation
    console.log('\n🔑 Testing JWT token generation...');
    const userId = new mongoose.Types.ObjectId().toString();
    console.log('Generated userId:', userId);
    console.log('userId type:', typeof userId);
    
    const token = jwt.sign(
      { 
        userId: userId,
        email: 'test@example.com',
        subscription: {
          plan: 'bronze',
          status: 'active'
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT token generated:', token.substring(0, 20) + '...');
    
    // Test JWT token verification
    console.log('\n🔐 Testing JWT token verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verified:', {
      userId: decoded.userId,
      email: decoded.email,
      subscription: decoded.subscription
    });
    console.log('Decoded userId type:', typeof decoded.userId);
    
    console.log('\n🎉 All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      console.error('\n🔴 MongoDB CONNECTION ISSUE:');
      console.error('- Check that your MongoDB Atlas username and password are correct');
      console.error('- Verify that your IP address is whitelisted in MongoDB Atlas');
      console.error('- Ensure the connection string format is correct');
      console.error('Connection string (partial):', 
        process.env.MONGODB_URI ? 
        `mongodb+srv://${process.env.MONGODB_URI.split('@')[0].split('//')[1].split(':')[0]}:****@${process.env.MONGODB_URI.split('@')[1].split('?')[0]}` : 
        'Not available');
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.error('\n🔴 JWT TOKEN ISSUE:');
      console.error('- Verify that JWT_SECRET is properly set in your .env.local file');
      console.error('- Check that the token format is correct');
    }
  } finally {
    // Always disconnect from MongoDB when done
    try {
      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
    } catch (disconnectError) {
      console.error('\n❌ Error disconnecting from MongoDB:', disconnectError);
    }
  }
}

testConnection();
