import type { Metadata } from 'next';

interface Props {
  params: Promise<{ handle: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  
  return {
    title: `@${handle}`,
    description: `Trade claws on @${handle}. Buy and sell using bonding curves on Base.`,
    openGraph: {
      title: `@${handle} | Claws.tech`,
      description: `Trade claws on @${handle}. Buy and sell using bonding curves on Base.`,
      images: [`/api/og?handle=${handle}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `@${handle} | Claws.tech`,
      description: `Trade claws on @${handle}. Buy and sell using bonding curves on Base.`,
      images: [`/api/og?handle=${handle}`],
    },
    other: {
      'fc:miniapp': JSON.stringify({
        version: '1',
        imageUrl: `https://claws.tech/api/og?handle=${handle}`,
        button: {
          title: `Trade @${handle}`,
          action: {
            type: 'launch_frame',
            name: 'Claws',
            url: `https://claws.tech/agent/${handle}`,
            splashImageUrl: 'https://claws.tech/logo.jpg',
            splashBackgroundColor: '#0a0a0a',
          },
        },
      }),
    },
  };
}

export default function AgentLayout({ children }: Props) {
  return <>{children}</>;
}
