// Console-based MongoDB connection test
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;
console.log('MongoDB URI exists:', !!uri);

async function testConnection() {
  if (!uri) {
    console.log('ERROR: MONGODB_URI is not defined in .env.local');
    return;
  }
  
  console.log('Attempting to connect to MongoDB...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('SUCCESS: Connected to MongoDB server');
    
    // Get database name from URI or use default
    let dbName = 'yoga-for-pe';
    if (uri.includes('/')) {
      const parts = uri.split('/');
      if (parts.length > 3) {
        dbName = parts[3].split('?')[0];
      }
    }
    
    console.log(`Using database: ${dbName}`);
    const db = client.db(dbName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    for (const collection of collections) {
      console.log(`- ${collection.name}`);
    }
    
    // Check for users collection
    if (collections.some(c => c.name === 'users')) {
      const users = await db.collection('users').countDocuments();
      console.log(`Found ${users} users in the database`);
    }
    
  } catch (error) {
    console.log('ERROR: MongoDB connection failed');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
console.log('=== MONGODB CONNECTION TEST ===');
testConnection().then(() => {
  console.log('=== TEST COMPLETED ===');
});
