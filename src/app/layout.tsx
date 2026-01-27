import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Providers from '@/components/Providers';
import '@/styles/globals.scss';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PATH Protocol | Yield Automation',
  description: 'Institutional-grade DeFi infrastructure for automated USDC yield optimization on the Base network.',
  keywords: ['DeFi', 'Yield', 'Automation', 'Base', 'Crypto', 'USDC'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link 
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen overflow-x-hidden grid-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
