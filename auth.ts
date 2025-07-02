import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import type { IAccountDoc } from './database/account.model';
import type { IUserDoc } from './database/user.model';

import { api } from './lib/api';
import { SignInSchema } from './lib/validations';

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
    Credentials({
      async authorize(credentials) {
        const validationResult = SignInSchema.safeParse(credentials);

        if (!validationResult.success) return null;

        const { email, password } = validationResult.data;

        const { data: existingAccount } = await (api.accounts.getByProvider(email) as Promise<ActionResponse<IAccountDoc>>);

        if (!existingAccount) return null;

        const { data: existingUser } = await (api.users.getById(existingAccount.userId.toString()) as Promise<ActionResponse<IUserDoc>>);

        if (!existingUser) return null;

        const isPasswordValid = await bcrypt.compare(password, existingAccount.password);

        if (!isPasswordValid) return null;

        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
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
        const provider = account.type === 'credentials' ? token.email! : account.providerAccountId;

        const { data: existingAccount, success } = await (api.accounts.getByProvider(provider) as Promise<ActionResponse<IAccountDoc>>);

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
