import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ROUTES from '@/constants/routes';

import { NavLinks } from './nav-links';

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger>
        <Image src="/icons/hamburger.svg" alt="Menu" width={23} height={23} className="invert-colors sm:hidden" />
      </SheetTrigger>
      <SheetContent side="left" className="background-light900_dark200 border-none">
        <SheetHeader>
          <SheetTitle className="hidden">Navigation</SheetTitle>
          <Link href="/" className="flex items-center gap-1">
            <Image src="/images/site-logo.svg" alt="DevOverflow Logo" width={23} height={23} />
            <p className="h3-semibold font-space-grotesk text-dark-100 dark:text-light-900 uppercase">
              Dev
              <span className="text-primary-500">
                Overflow
              </span>
            </p>
          </Link>
        </SheetHeader>
        <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto px-4">
          <SheetClose asChild>
            <section className="flex h-full flex-col gap-4 pt-16">
              <NavLinks isMobileNav />
            </section>
          </SheetClose>

          <div className="flex flex-col gap-3">
            <SheetClose asChild>
              <Link href={ROUTES.SIGN_IN}>
                <Button className="small-medium btn-secondary min-h-[41px] w-full px-4 py-3 shadow-none">
                  <span className="primary-text-gradient">Log In</span>
                </Button>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href={ROUTES.SIGN_UP}>
                <Button className="small-medium btn-tertiary text-dark400_light900 min-h-[41px] w-full px-4 py-3 border shadow-none">
                  Sign Up
                </Button>
              </Link>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
