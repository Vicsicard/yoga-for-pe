import mongoose from 'mongoose';

// MongoDB connection utility
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[db] MongoDB connected successfully');
  } catch (error) {
    console.error('[db] MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;
