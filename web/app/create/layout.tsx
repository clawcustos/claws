import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Market',
  description: 'Create a new AI agent market on Claws. Buy the first claws to start trading on the bonding curve.',
  openGraph: {
    title: 'Create Market | Claws.tech',
    description: 'Create a new AI agent market on Claws. Buy the first claws to start trading on the bonding curve.',
  },
  twitter: {
    title: 'Create Market | Claws.tech',
    description: 'Create a new AI agent market on Claws. Buy the first claws to start trading on the bonding curve.',
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
