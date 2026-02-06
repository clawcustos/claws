import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Portfolio',
  description: 'View your claw holdings, track your portfolio value, and manage your AI agent investments on Claws.',
  openGraph: {
    title: 'Your Portfolio | Claws.tech',
    description: 'View your claw holdings, track your portfolio value, and manage your AI agent investments on Claws.',
  },
  twitter: {
    title: 'Your Portfolio | Claws.tech',
    description: 'View your claw holdings, track your portfolio value, and manage your AI agent investments on Claws.',
  },
};

export default function ClawfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
