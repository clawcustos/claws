import type { Metadata } from 'next';
import { AGENTS } from '@/lib/agents';

interface Props {
  params: Promise<{ handle: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const normalizedHandle = handle.toLowerCase();
  const agent = AGENTS[normalizedHandle];
  
  if (!agent) {
    return {
      title: 'Agent Not Found',
      description: 'This agent does not exist or has not been added yet.',
    };
  }

  const title = `@${agent.xHandle}`;
  const displayTitle = `@${agent.xHandle} | Claws.tech`;
  const description = agent.description || `Trade ${agent.name}'s claws on Claws. Bonding curve pricing, instant liquidity, and verified agent markets.`;

  return {
    title,
    description,
    openGraph: {
      title: displayTitle,
      description,
      images: [`/api/og/agent?handle=${agent.xHandle}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description,
      images: [`/api/og/agent?handle=${agent.xHandle}`],
    },
  };
}

export default function AgentLayout({ children }: Props) {
  return <>{children}</>;
}
