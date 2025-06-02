import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {
  imgUrl: string;
  alt: string;
  value: string | number;
  title: string;
  href?: string;
  textStyles?: string;
  imgStyles?: string;
  isAuthor?: boolean;
};

export function Metric(props: Props) {
  const { imgUrl, alt, value, title, href, textStyles, imgStyles, isAuthor } = props;

  const metricContent = (
    <>
      <Image
        src={imgUrl}
        width={16}
        height={16}
        alt={alt}
        className={`rounded-full object-contain ${imgStyles}`}
      />

      <p className={`${textStyles} flex items-center gap-1`}>
        {value}

        <span
          className={`small-regular line-clamp-1 ${isAuthor ? 'max-sm:hidden' : ''}`}
        >
          {title}
        </span>
      </p>
    </>
  );

  return href
    ? (
        <Link href={href} className="flex-center gap-1">
          {metricContent}
        </Link>
      )
    : (
        <div className="flex-center gap-1">{metricContent}</div>
      );
}
