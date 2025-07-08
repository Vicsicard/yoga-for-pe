// This file sets the runtime to nodejs so it can use bcrypt
export const runtime = 'nodejs';

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define authentication handler
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          
          // In production, this would connect to your database
          // For build purposes, we're using a simplified mock user
          
          // Using dynamic import for bcrypt to ensure edge compatibility
          const bcrypt = await import('bcryptjs');
          
          // Mock user for build verification
          const mockUser = {
            id: "mock-user-id",
            name: "Yoga Instructor",
            email: "user@example.com",
            hashedPassword: bcrypt.hashSync("password123", 10)
          };
          
          if (credentials.email !== mockUser.email) {
            return null;
          }
          
          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            mockUser.hashedPassword
          );
          
          if (!isCorrectPassword) {
            return null;
          }
          
          return {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  }
});
