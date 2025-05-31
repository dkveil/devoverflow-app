'use server';

import { signIn } from '@/auth';
import ROUTES from '@/constants/routes';

type SignInProvider = 'github' | 'google';

export async function handleSignIn(formData: FormData) {
  const provider = formData.get('provider') as SignInProvider | null;

  if (!provider) return;

  return signIn(provider, { redirectTo: ROUTES.HOME });
}
