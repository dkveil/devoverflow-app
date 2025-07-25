'use client';

import Image from 'next/image';
import { useQueryState } from 'nuqs';
import React, { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';

import { GlobalResult } from './global-result';

export function GlobalSearch() {
  const [global, setGlobal] = useQueryState('global', {
    defaultValue: '',
    parse: value => value as string,
    shallow: false,
  });

  const [search, setSearch] = useState(global || '');
  const [isOpen, setIsOpen] = useState(Boolean(global));
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current
        && !(searchContainerRef.current as Node).contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        setGlobal(search);
      } else {
        setGlobal('');
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, setGlobal]);

  return (
    <div
      className="relative w-full max-w-[600px] max-lg:hidden"
      ref={searchContainerRef}
    >
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <Image
          src="/icons/search.svg"
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />

        <Input
          type="text"
          placeholder="Search anything globally..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === '' && isOpen) setIsOpen(false);
          }}
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
        />
      </div>
      {isOpen && <GlobalResult />}
    </div>
  );
};
