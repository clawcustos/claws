import type { Metadata, Viewport } from 'next';
import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';

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
  title: 'claws.tech',
  description: 'Speculate on agent markets. Be early to your favorite agents.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Claws',
  },
  openGraph: {
    title: 'claws.tech',
    description: 'Speculate on agent markets. Be early to your favorite agents.',
    images: ['/logo.jpg'],
  },
  twitter: {
    card: 'summary',
    title: 'claws.tech',
    description: 'Speculate on agent markets. Be early to your favorite agents.',
    images: ['/logo.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#b91c1c',
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
      </body>
    </html>
  );
}
