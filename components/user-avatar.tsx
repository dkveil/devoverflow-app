import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import ROUTES from '@/constants/routes';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from './ui/avatar';

type Props = {
  id: string;
  name: string;
  image?: string | null;
  className?: string;
  width?: number;
  height?: number;
  fallbackClassName?: string;
};

export function UserAvatar({ id, name, image, className = 'h-9 w-9', width = 36, height = 36, fallbackClassName }: Props) {
  const initials = name
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={ROUTES.PROFILE(id)}>
      <Avatar className={className}>
        {image
          ? (
              <Image
                src={image}
                alt={name}
                className="object-cover"
                width={width}
                height={height}
                quality={100}
              />
            )
          : (
              <AvatarFallback className={cn('primary-gradient font-space-grotesk font-bold tracking-wider text-white', fallbackClassName)}>
                {initials}
              </AvatarFallback>
            )}
      </Avatar>
    </Link>
  );
}
