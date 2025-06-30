// src/lib/authOptions.ts
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import type { Account, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/calendar',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      console.log('✅ signIn callback for:', user.email);
      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },

    async jwt({
      token,
      account,
      user,
    }: {
      token: JWT;
      account?: Account | null;
      user?: User;
    }) {
      // Prefer user.email (on first sign-in) then token.email
      const email = user?.email || token.email;

      if (account && email) {
        await prisma.googleToken.upsert({
          where: { email },
          update: {
            accessToken: account.access_token!,
            refreshToken: account.refresh_token!,
            scope: account.scope ?? undefined,
            tokenType: account.token_type!,
            expiryDate: BigInt(account.expires_at! * 1000),
          },
          create: {
            email,
            accessToken: account.access_token!,
            refreshToken: account.refresh_token!,
            scope: account.scope ?? undefined,
            tokenType: account.token_type!,
            expiryDate: BigInt(account.expires_at! * 1000),
          },
        });

        token.email = email; // Persist for future callbacks
      }

      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
