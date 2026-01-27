import type { Metadata } from 'next';
import { Orbitron, Exo_2 } from 'next/font/google';
import Providers from '@/components/Providers';
import '@/styles/globals.scss';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PATH Protocol - DeFi Automation Platform',
  description: 'Automated yield optimization and rebalancing for your crypto assets on Base',
  keywords: ['DeFi', 'Yield', 'Automation', 'Base', 'Crypto', 'USDC'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${exo2.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
