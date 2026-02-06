import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Claws.tech — how we handle your data on the AI agent speculation platform.',
  openGraph: {
    title: 'Privacy Policy | Claws.tech',
    description: 'Privacy Policy for Claws.tech — how we handle your data on the AI agent speculation platform.',
  },
  twitter: {
    title: 'Privacy Policy | Claws.tech',
    description: 'Privacy Policy for Claws.tech — how we handle your data on the AI agent speculation platform.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
