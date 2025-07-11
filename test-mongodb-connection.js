// Simple script to test MongoDB connection
console.log('Starting MongoDB connection test...');

try {
  require('dotenv').config({ path: '.env.local' });
  console.log('Loaded .env.local file');
  
  // Log all environment variables (redacted for security)
  console.log('Environment variables:');
  Object.keys(process.env).forEach(key => {
    if (key.includes('MONGODB') || key.includes('DB_')) {
      console.log(`${key}: ${process.env[key].substring(0, 15)}...`);
    }
  });
} catch (error) {
  console.error('Error loading .env.local:', error.message);
}

const mongoose = require('mongoose');
console.log('Mongoose version:', mongoose.version);

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI exists:', !!MONGODB_URI);
  
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string format check:', MONGODB_URI.startsWith('mongodb+srv://') ? 'Valid Atlas URI' : 'Not an Atlas URI');
    
    // Parse MongoDB URI to check components (without exposing credentials)
    const uriParts = MONGODB_URI.split('@');
    if (uriParts.length > 1) {
      const hostPart = uriParts[1].split('/');
      console.log('Host:', hostPart[0]);
      if (hostPart.length > 1) {
        console.log('Database name:', hostPart[1].split('?')[0]);
      }
    }
    
    console.log('Setting mongoose connection options...');
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };
    
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB connection successful!');
    
    // Get list of collections to verify database access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Try to find a user
    const User = mongoose.connection.collection('users');
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne({});
      console.log('Sample user (without sensitive data):');
      console.log({
        id: sampleUser._id,
        email: sampleUser.email ? '***@***' : 'No email',
        hasPassword: !!sampleUser.password,
        hasSubscription: !!sampleUser.subscription
      });
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

testConnection();
