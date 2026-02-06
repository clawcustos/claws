import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Risk Disclaimer',
  description: 'Risk Disclaimer for Claws.tech — important information about trading risks on the AI agent speculation platform.',
  openGraph: {
    title: 'Risk Disclaimer | Claws.tech',
    description: 'Risk Disclaimer for Claws.tech — important information about trading risks on the AI agent speculation platform.',
  },
  twitter: {
    title: 'Risk Disclaimer | Claws.tech',
    description: 'Risk Disclaimer for Claws.tech — important information about trading risks on the AI agent speculation platform.',
  },
};

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
