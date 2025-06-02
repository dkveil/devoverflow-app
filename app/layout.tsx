import type { Metadata } from 'next';

import { SessionProvider } from 'next-auth/react';
import localFont from 'next/font/local';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import './globals.css';

import { auth } from '@/auth';
import { Toaster } from '@/components/ui/sonner';
import ThemeProvider from '@/context/theme';

const inter = localFont({
  src: './fonts/InterVF.ttf',
  variable: '--font-inter',
  weight: '100 200 300 400 500 600 700 800 900',
});

const spaceGrotesk = localFont({
  src: './fonts/SpaceGroteskVF.ttf',
  variable: '--font-space-grotesk',
  weight: '300 400 500 600 700',
});

export const metadata: Metadata = {
  title: 'DevOverflow',
  description: 'DevOverflow is a modern Q&A platform for developers, inspired by StackOverflow but with enhanced features and a fresh user experience.',
  icons: {
    icon: '/images/site-logo.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <SessionProvider session={session}>
        <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster />
          </ThemeProvider>
        </body>
      </SessionProvider>
    </html>
  );
}
