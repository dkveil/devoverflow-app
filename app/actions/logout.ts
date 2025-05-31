'use server';

import { signOut } from '@/auth';
import ROUTES from '@/constants/routes';

export async function handleLogout() {
  await signOut({ redirectTo: ROUTES.SIGN_IN });
}
