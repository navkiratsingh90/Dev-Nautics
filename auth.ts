import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import connectDb from "./lib/db";
import User from "./models/user-model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDb();

        const user = await User.findOne({
          email: credentials.email,
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email first");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role || "user",
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDb();

        const existingUser = await User.findOne({
          email: user.email,
        });

        if (!existingUser) {
          await User.create({
            username:
              user.name?.replace(/\s+/g, "").toLowerCase() ||
              `user${Date.now()}`,

            email: user.email,

            password: await bcrypt.hash(
              Math.random().toString(36),
              10
            ),

            isVerified: true,

            role: "user",
          });
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      if (token.email) {
        await connectDb();

        const dbUser = await User.findOne({
          email: token.email,
        });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role || "user";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,
});