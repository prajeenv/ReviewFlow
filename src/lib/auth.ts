import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { SESSION_CONFIG } from "./constants";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: SESSION_CONFIG.MAX_AGE_DAYS * 24 * 60 * 60, // 30 days
    updateAge: SESSION_CONFIG.UPDATE_AGE_DAYS * 24 * 60 * 60, // 1 day
  },

  providers: [
    // Email/Password Provider
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tier: user.tier,
        };
      },
    }),

    // Google OAuth Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // OAuth users have pre-verified email
      if (account?.provider === "google" && user.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: new Date() },
          });
        } catch {
          // User might not exist yet, that's OK - adapter will create them
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.tier = (user as { tier?: string }).tier || "FREE";
      }

      // Handle session updates (e.g., tier upgrade)
      if (trigger === "update" && session) {
        if (session.tier) token.tier = session.tier;
        if (session.name) token.name = session.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tier = token.tier as string;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.id) {
        // Initialize new user with default values
        await prisma.user.update({
          where: { id: user.id },
          data: {
            credits: 15,
            tier: "FREE",
            sentimentQuota: 35,
            sentimentUsed: 0,
            creditsResetDate: new Date(),
            sentimentResetDate: new Date(),
          },
        });

        // Create default brand voice
        await prisma.brandVoice.create({
          data: {
            userId: user.id,
            tone: "professional",
            formality: 3,
            keyPhrases: ["Thank you", "We appreciate your feedback"],
            styleNotes: "Be genuine and empathetic",
          },
        });
      }
    },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/onboarding",
  },

  debug: process.env.NODE_ENV === "development",
});
