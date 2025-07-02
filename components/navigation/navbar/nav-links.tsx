'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { SheetClose } from '@/components/ui/sheet';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

type Props = {
  userId?: string;
  isMobileNav?: boolean;
};

export function NavLinks({ userId, isMobileNav = false }: Props) {
  const pathname = usePathname();

  return (
    <>
      {sidebarLinks.map((item) => {
        const isActive
          = (pathname.includes(item.route) && item.route.length > 1)
            || pathname === item.route;

        if (item.route === '/profile') {
          if (userId) item.route = `${item.route}/${userId}`;
          else return null;
        }

        const LinkComponent = (
          <Link
            href={item.route}
            key={item.label}
            className={cn(
              isActive
                ? 'primary-gradient text-light-900'
                : 'text-dark300_light900',
              'flex items-center justify-start gap-4 bg-transparent p-3',
            )}
          >
            <Image
              src={item.imgURL}
              alt={item.label}
              width={20}
              height={20}
              className={cn({ 'invert-colors': !isActive, 'mx-auto lg:mx-0': !isMobileNav })}
            />
            <p
              className={cn('uppercase', isActive ? 'body-semibold' : 'body-medium', !isMobileNav && 'max-lg:hidden')}
            >
              {item.label}
            </p>
          </Link>
        );

        return isMobileNav
          ? (
              <SheetClose asChild key={item.route}>
                {LinkComponent}
              </SheetClose>
            )
          : (
              <React.Fragment key={item.route}>{LinkComponent}</React.Fragment>
            );
      })}
    </>
  );
};
