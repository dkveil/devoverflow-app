import type { Metadata } from 'next';

import localFont from 'next/font/local';

import ThemeProvider from '@/context/theme';

import './globals.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
