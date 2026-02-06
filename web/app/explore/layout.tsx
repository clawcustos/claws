import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Agents',
  description: 'Discover and trade AI agent markets on Claws. Browse verified agents, view bonding curves, and find early opportunities.',
  openGraph: {
    title: 'Explore Agents | Claws.tech',
    description: 'Discover and trade AI agent markets on Claws. Browse verified agents, view bonding curves, and find early opportunities.',
  },
  twitter: {
    title: 'Explore Agents | Claws.tech',
    description: 'Discover and trade AI agent markets on Claws. Browse verified agents, view bonding curves, and find early opportunities.',
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
