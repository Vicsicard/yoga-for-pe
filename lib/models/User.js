// Force Node.js runtime for this module
export const runtime = 'nodejs';

// Explicitly prevent this module from being imported on the client side
if (typeof window !== 'undefined') {
  throw new Error('This module is server-side only and cannot be used on the client');
}

// Dynamic imports for server-side only packages
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Only define and use mongoose in Node.js environment
let mongoose, User, userSchema;

// Safely require mongoose
try {
  mongoose = require('mongoose');
  
  // Define the user schema
  userSchema = new mongoose.Schema({
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
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
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
        userId: this._id.toString(), 
        email: this.email,
        subscription: {
          plan: this.subscription.plan,
          status: this.subscription.status,
          currentPeriodEnd: this.subscription.currentPeriodEnd,
          stripeCustomerId: this.subscription.stripeCustomerId,
          stripeSubscriptionId: this.subscription.stripeSubscriptionId
        }
      },
      process.env.JWT_SECRET || 'development-secret-key',
      { expiresIn: '7d' }
    );
  };

  // Create the model
  User = mongoose.models.User || mongoose.model('User', userSchema);
} catch (error) {
  console.error('Failed to initialize mongoose model:', error);
  // Provide a mock User model if mongoose fails to load
  User = {
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export default User;
