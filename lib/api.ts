import type { IAccount } from '@/database/account.model';
import type { IUser } from '@/database/user.model';

import { fetchHandler } from './handlers/fetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3137/api';

export const api = {
  auth: {
    oAuthSignIn: ({ provider, providerAccountId, user }: SignInWithOAuthParams) => fetchHandler(`${API_BASE_URL}/auth/oauth-signin`, { method: 'POST', body: JSON.stringify({ provider, providerAccountId, user }) }),
  },
  users: {
    getAll: () => fetchHandler(`${API_BASE_URL}/users`),
    getById: (id: string) => fetchHandler(`${API_BASE_URL}/users/${id}`),
    getByEmail: (email: string) => fetchHandler(`${API_BASE_URL}/users/email/`, { method: 'POST', body: JSON.stringify({ email }) }),
    create: (userData: Partial<IUser>) => fetchHandler(`${API_BASE_URL}/users`, { method: 'POST', body: JSON.stringify(userData) }),
    update: (id: string, userData: Partial<IUser>) => fetchHandler(`${API_BASE_URL}/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
    delete: (id: string) => fetchHandler(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' }),
  },
  accounts: {
    getAll: () => fetchHandler(`${API_BASE_URL}/accounts`),
    getById: (id: string) => fetchHandler(`${API_BASE_URL}/accounts/${id}`),
    getByProvider: (provider: string) => fetchHandler(`${API_BASE_URL}/accounts/provider`, { method: 'POST', body: JSON.stringify({ providerAccountId: provider }) }),
    create: (accountData: Partial<IAccount>) => fetchHandler(`${API_BASE_URL}/accounts`, { method: 'POST', body: JSON.stringify(accountData) }),
    update: (id: string, accountData: Partial<IAccount>) => fetchHandler(`${API_BASE_URL}/accounts/${id}`, { method: 'PUT', body: JSON.stringify(accountData) }),
    delete: (id: string) => fetchHandler(`${API_BASE_URL}/accounts/${id}`, { method: 'DELETE' }),
  },
  ai: {
    getAnswer: (question: string, content: string, userAnswer: string): Promise<AIAnswerResponse> =>
      fetchHandler<AIAnswerData>(`${API_BASE_URL}/ai/answers`, {
        method: 'POST',
        body: JSON.stringify({ question, content, userAnswer } satisfies AIAnswerRequest),
      }),
  },
};
