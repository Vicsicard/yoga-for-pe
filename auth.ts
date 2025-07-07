// Set runtime to Node.js for auth file
export const runtime = 'nodejs';

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import connectDB from "./lib/db/db";
import User from "./lib/models/User";

// Define user type for TypeScript
interface UserDocument {
  _id: string;
  email: string;
  password: string;
  name: string;
  subscription?: {
    status?: string;
    plan?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
  };
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

// Configure NextAuth
export const authConfig = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Only try to connect to DB if we're not in Edge Runtime
          if (typeof process !== 'undefined' && 
              process.versions != null && 
              process.versions.node != null &&
              !process.env.NEXT_RUNTIME) {
            await connectDB();
          }

          // Find user by email
          // Use type assertion to handle the mongoose model in TypeScript
          const user = await User.findOne({ email: credentials.email }).select('+password') as UserDocument;
          
          // User not found
          if (!user) {
            console.log('User not found');
            return null;
          }
          
          // Compare passwords
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Check if subscription is active
          if (user.subscription?.plan !== 'bronze' && 
              (!user.subscription?.status || user.subscription?.status !== 'active')) {
            throw new Error('Subscription is not active');
          }
          
          // Return user object without password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            subscription: user.subscription,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to JWT token
      if (user) {
        token.id = user.id;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token) {
        session.user.id = token.id;
        session.user.subscription = token.subscription;
      }
      return session;
    }
  },
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
  },
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-should-be-changed",
};

// Export both the config (for API routes) and the handlers (for direct usage)
export default NextAuth(authConfig);
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
