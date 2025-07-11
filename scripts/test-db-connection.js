const mongoose = require('mongoose');

// Use the correct connection string
const MONGODB_URI = 'mongodb+srv://vicsicard:nF4Hj77WNdX0u7a5@clusteryoga.ft5hd6x.mongodb.net/?retryWrites=true&w=majority&appName=Clusteryoga';

console.log('Testing MongoDB connection...');
console.log('MongoDB URI exists:', !!MONGODB_URI);

// Function to test connection
async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Connection details:');
    console.log('- Host:', mongoose.connection.host);
    console.log('- Database:', mongoose.connection.name);
    console.log('- Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error codeName:', error.codeName);
    
    // Log a hint about password special characters if it's an authentication error
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.log('\n🔍 POSSIBLE SOLUTION:');
      console.log('The error might be related to special characters in your password.');
      console.log('Try updating your connection string to ensure special characters are properly encoded:');
      console.log('Example: ! should be %21, @ should be %40, etc.');
      console.log('Or try creating a new database user with a simpler password (letters and numbers only).');
    }
  } finally {
    process.exit(0);
  }
}

// Run the test
testConnection();
