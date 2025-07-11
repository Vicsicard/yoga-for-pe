// Minimal MongoDB connection test
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;
console.log('MongoDB URI exists:', !!uri);
console.log('MongoDB URI prefix:', uri ? uri.substring(0, 20) + '...' : 'undefined');

async function testConnection() {
  console.log('\n=== STARTING MONGODB CONNECTION TEST ===');
  
  if (!uri) {
    console.error('❌ ERROR: MONGODB_URI is not defined in .env.local');
    return false;
  }
  
  const client = new MongoClient(uri);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ SUCCESS: Connected to MongoDB server');
    
    // Get database name from URI
    const dbName = uri.split('/').pop().split('?')[0] || 'yoga-for-pe';
    console.log(`Using database: ${dbName}`);
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(c => console.log(`- ${c.name}`));
    
    return true;
  } catch (error) {
    console.error('❌ ERROR: MongoDB connection failed');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    return false;
  } finally {
    console.log('Closing MongoDB connection...');
    await client.close();
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('\n=== TEST RESULT ===');
    console.log(success ? '✅ SUCCESS: MongoDB connection test passed' : '❌ FAILURE: MongoDB connection test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n=== UNEXPECTED ERROR ===');
    console.error(err);
    process.exit(1);
  });
