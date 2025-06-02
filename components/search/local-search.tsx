'use client';

import Image from 'next/image';
import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';

import { useDebounce } from '@/hooks/use-debounce';

import { Input } from '../ui/input';

type Props = {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
};

export function LocalSearch(props: Props) {
  const { imgSrc, placeholder, otherClasses } = props;

  const [inputValue, setInputValue] = useState('');
  const [_, setSearchQuery] = useQueryState('query', {
    defaultValue: '',
    shallow: false,
  });

  const debouncedValue = useDebounce(inputValue);

  useEffect(() => {
    setSearchQuery(debouncedValue);
  }, [debouncedValue, setSearchQuery]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        alt="search"
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        value={inputValue}
        className="dark:bg-background-light800_darkgradient paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
    </div>
  );
};
