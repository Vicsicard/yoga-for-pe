// Direct MongoDB connection test using native driver
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
console.log('MongoDB URI exists:', !!MONGODB_URI);
console.log('MongoDB URI starts with:', MONGODB_URI ? MONGODB_URI.substring(0, 12) + '...' : 'undefined');

async function testDirectConnection() {
  console.log('Starting direct MongoDB connection test...');
  
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in environment variables');
    return false;
  }
  
  const client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000
  });
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully to MongoDB server');
    
    // List databases
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Connect to the specific database
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    console.log(`Connecting to database: ${dbName}`);
    const db = client.db(dbName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`Collections in ${dbName}:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Try to query users collection
    if (collections.some(c => c.name === 'users')) {
      console.log('Querying users collection...');
      const users = await db.collection('users').find({}).limit(1).toArray();
      console.log(`Found ${users.length} users`);
      if (users.length > 0) {
        console.log('Sample user ID:', users[0]._id);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    return false;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testDirectConnection()
  .then(success => {
    console.log('Test completed with status:', success ? 'SUCCESS' : 'FAILURE');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
