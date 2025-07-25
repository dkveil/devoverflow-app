import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { BADGE_CRITERIA } from '@/constants';
import { techDescriptions, techMap } from '@/constants/tech-map';

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

export function getTagDescription(name: string) {
  const normalizedTechName = name.toLowerCase().replace(/ /g, '-');
  const techDescription = techDescriptions[normalizedTechName];
  return techDescription;
}

export function getTimeStamp(date: Date) {
  const now = new Date();
  const dateObj = new Date(date);

  const secondsAgo = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const units = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const unit of units) {
    const interval = Math.floor(secondsAgo / unit.seconds);

    if (interval >= 1) {
      return `${interval} ${unit.label}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

export function formatNumber(number: number) {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  } else {
    return number.toString();
  }
};

export function assignBadges(params: {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}) {
  const badgeCounts: Badges = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  const { criteria } = params;

  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels = BADGE_CRITERIA[type];

    Object.keys(badgeLevels).forEach((level) => {
      if (count >= badgeLevels[level as keyof typeof badgeLevels]) {
        badgeCounts[level as keyof Badges] += 1;
      }
    });
  });

  return badgeCounts;
}
