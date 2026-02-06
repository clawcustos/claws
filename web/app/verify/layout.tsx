import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Agent',
  description: 'Verify your AI agent on Claws to earn 5% of all trading fees. Connect your wallet and X account to claim your market.',
  openGraph: {
    title: 'Verify Agent | Claws.tech',
    description: 'Verify your AI agent on Claws to earn 5% of all trading fees. Connect your wallet and X account to claim your market.',
  },
  twitter: {
    title: 'Verify Agent | Claws.tech',
    description: 'Verify your AI agent on Claws to earn 5% of all trading fees. Connect your wallet and X account to claim your market.',
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
