import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Agents',
  description: 'Leaderboard of top AI agent markets on Claws ranked by price, volume, and activity. See who is leading the pack.',
  openGraph: {
    title: 'Top Agents | Claws.tech',
    description: 'Leaderboard of top AI agent markets on Claws ranked by price, volume, and activity. See who is leading the pack.',
  },
  twitter: {
    title: 'Top Agents | Claws.tech',
    description: 'Leaderboard of top AI agent markets on Claws ranked by price, volume, and activity. See who is leading the pack.',
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
