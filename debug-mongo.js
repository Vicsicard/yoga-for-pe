// Debug MongoDB connection
console.log('Starting MongoDB debug script...');

// Load environment variables
try {
  console.log('Loading .env.local file...');
  require('dotenv').config({ path: '.env.local' });
  console.log('Loaded .env.local successfully');
} catch (err) {
  console.log('Error loading .env.local:', err);
}

// Check MongoDB URI
const uri = process.env.MONGODB_URI;
console.log('MONGODB_URI exists:', !!uri);
if (uri) {
  // Only show part of the URI for security
  console.log('MONGODB_URI starts with:', uri.substring(0, 20) + '...');
}

// Import MongoDB
console.log('Importing MongoDB...');
const { MongoClient } = require('mongodb');
console.log('MongoDB imported successfully');

// Create client
console.log('Creating MongoDB client...');
const client = new MongoClient(uri, {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000
});
console.log('MongoDB client created');

// Connect function
async function connectToMongo() {
  console.log('Starting connection attempt...');
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    
    // Get database
    console.log('Getting database...');
    const db = client.db();
    console.log('Got database');
    
    // List collections
    console.log('Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections`);
    collections.forEach(c => console.log(`- ${c.name}`));
    
    // Close connection
    console.log('Closing connection...');
    await client.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.log('Error connecting to MongoDB:');
    console.log('- Name:', error.name);
    console.log('- Message:', error.message);
    console.log('- Code:', error.code);
    console.log('- Stack:', error.stack);
  }
}

// Run the connection test
console.log('Running connection test...');
connectToMongo().then(() => {
  console.log('Test completed');
});
