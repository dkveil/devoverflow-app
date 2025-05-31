import Image from 'next/image';

import { Button } from '@/components/ui/button';

import { handleSignIn } from './actions';

export default function SocialAuthForm() {
  const buttonClasses = 'background-dark400_light900 body-medium text-dark200_light9800 min-h-12 flex-1 px-4 py-3.5';

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <form action={handleSignIn}>
        <input className="hidden" name="provider" value="github" readOnly />
        <Button className={buttonClasses} type="submit">
          <Image src="/icons/github.svg" alt="Github Logo" width={20} height={20} className="invert-colors mr-2.5 object-contain" />
          <span>Continue with Github</span>
        </Button>
      </form>

      <form action={handleSignIn}>
        <input className="hidden" name="provider" value="google" readOnly />
        <Button className={buttonClasses} type="submit">
          <Image src="/icons/google.svg" alt="Google Logo" width={20} height={20} className="invert-colors mr-2.5 object-contain" />
          <span>Continue with Google</span>
        </Button>
      </form>
    </div>
  );
}
