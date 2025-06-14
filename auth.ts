import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import type { IAccountDoc } from './database/account.model';

import { api } from './lib/api';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: {
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`,
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        const { data: existingAccount, success } = await (api.accounts.getByProvider(account.provider as 'github' | 'google') as Promise<ActionResponse<IAccountDoc>>);

        if (!success || !existingAccount) return token;

        const userId = existingAccount.userId;

        if (userId) token.sub = userId.toString();
      }

      return token;
    },
    async signIn({ user, profile, account }) {
      if (account?.type === 'credentials') return true;
      if (!account || !user) return false;

      const userInfo = {
        name: user.name as string,
        username: account.provider === 'github' ? (profile?.login as string) : (user.name as string).toLowerCase(),
        email: user.email as string,
        image: user.image as string,
      };

      const { success } = await api.auth.oAuthSignIn({
        provider: account.provider as 'github' | 'google',
        providerAccountId: account.providerAccountId,
        user: userInfo,
      }) as ActionResponse;

      if (!success) return false;

      return true;
    },
  },
});
