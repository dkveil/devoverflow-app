'use client';

import type { ThemeProviderProps } from 'next-themes';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
