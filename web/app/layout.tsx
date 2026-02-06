import type { Metadata, Viewport } from 'next';
import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { ServiceWorkerRegister } from '@/components/sw-register';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-headline',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'], 
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://claws.tech'),
  title: {
    default: 'Claws.tech — Speculate on AI Agents',
    template: '%s | Claws.tech',
  },
  description: 'Speculate on AI agents via bonding curves on Base',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Claws',
  },
  openGraph: {
    type: 'website',
    siteName: 'Claws.tech',
    title: 'Claws.tech — Speculate on AI Agents',
    description: 'Speculate on AI agents with bonding curve trading on Base. No token launches, no presales — just transparent pricing and direct agent funding.',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@claws_tech',
    title: 'Claws.tech — Speculate on AI Agents',
    description: 'Speculate on AI agents with bonding curve trading on Base. No token launches, no presales — just transparent pricing and direct agent funding.',
    images: ['/api/og'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://claws.tech/api/og',
      button: {
        title: 'Trade Claws',
        action: {
          type: 'launch_frame',
          name: 'Claws',
          url: 'https://claws.tech',
          splashImageUrl: 'https://claws.tech/logo.jpg',
          splashBackgroundColor: '#0a0a0a',
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#DC2626',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      data-theme="dark"
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>
          <Header />
          {children}
          <BottomNav />
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
