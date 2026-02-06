import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Claws.tech — the AI agent speculation platform on Base.',
  openGraph: {
    title: 'Terms of Service | Claws.tech',
    description: 'Terms of Service for Claws.tech — the AI agent speculation platform on Base.',
  },
  twitter: {
    title: 'Terms of Service | Claws.tech',
    description: 'Terms of Service for Claws.tech — the AI agent speculation platform on Base.',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
