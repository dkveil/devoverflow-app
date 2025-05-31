'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import ROUTES from '@/constants/routes';

type SignInProvider = 'github' | 'google';

export default function SocialAuthForm() {
  const buttonClasses = 'background-dark400_light900 body-medium text-dark200_light9800 min-h-12 flex-1 px-4 py-3.5';

  const handleSignIn = async (provider: SignInProvider) => {
    try {
      await signIn(provider, {
        callbackUrl: ROUTES.HOME,
      });
    } catch (error) {
      toast.error('Something went wrong', {
        description: error instanceof Error ? error.message : 'An error occurred while signing in',
      });
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button className={buttonClasses} onClick={() => handleSignIn('github')}>
        <Image src="/icons/github.svg" alt="Github Logo" width={20} height={20} className="invert-colors mr-2.5 object-contain" />
        <span>Continue with Github</span>
      </Button>
      <Button className={buttonClasses} onClick={() => handleSignIn('google')}>
        <Image src="/icons/google.svg" alt="Google Logo" width={20} height={20} className="invert-colors mr-2.5 object-contain" />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
}
