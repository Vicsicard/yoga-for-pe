import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Define the user schema if not using MongoDB driver directly
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't include password in query results by default
  },
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'past_due', 'canceled', 'trialing'],
      default: 'inactive',
    },
    plan: {
      type: String,
      enum: ['bronze', 'silver', 'gold'],
      default: 'bronze', // Free tier
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email,
      subscription: {
        plan: this.subscription.plan,
        status: this.subscription.status
      }
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Create the model if mongoose is being used
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
