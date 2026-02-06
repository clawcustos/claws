import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Markets',
  description: 'Community-created AI agent markets on Claws. Discover new trading opportunities created by the community.',
  openGraph: {
    title: 'New Markets | Claws.tech',
    description: 'Community-created AI agent markets on Claws. Discover new trading opportunities created by the community.',
  },
  twitter: {
    title: 'New Markets | Claws.tech',
    description: 'Community-created AI agent markets on Claws. Discover new trading opportunities created by the community.',
  },
};

export default function NewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
