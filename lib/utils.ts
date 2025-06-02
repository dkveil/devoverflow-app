import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { techMap } from '@/constants/tech-map';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDeviconIcon(name: string) {
  const normalizedTechName = name.toLowerCase().replace(/ /g, '-');

  const techIconClass = techMap[normalizedTechName];

  if (!techIconClass) {
    return `devicon-${normalizedTechName}-plain`;
  }

  return techIconClass;
}
