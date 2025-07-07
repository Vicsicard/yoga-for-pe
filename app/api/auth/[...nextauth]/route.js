// Ensure Node.js runtime to avoid Edge runtime issues with Mongoose
export const runtime = 'nodejs';

// Disable static optimization to ensure this runs as a Node.js API route
export const dynamic = 'force-dynamic';

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import connectDB, { getUserModel } from "../../../../lib/db/db";

// Debug logging for troubleshooting
console.log('NextAuth API route initialized directly');

// Test the database connection
try {
  connectDB().then(() => console.log('MongoDB connected in NextAuth route'));
} catch (error) {
  console.error('MongoDB connection error in NextAuth route:', error);
}

// Create NextAuth handler with proper configuration
const handler = NextAuth({
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
          await connectDB();
          
          // Get User model and find user by email
          const User = getUserModel();
          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user) {
            return null;
          }
          
          // Compare passwords
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production",
});

// Export the handlers directly
export const GET = handler;
export const POST = handler;

// Implement a basic health check endpoint to test if this route is functioning
export async function HEAD(req) {
  return new Response(null, { status: 200 });
}
