'use client';

import { AgentCard } from './agent-card';
import { Agent } from '@/lib/types';

// Mock data - replace with real data from indexer
const MOCK_AGENTS: Agent[] = [
  {
    address: '0x0000000000000000000000000000000000000001',
    xHandle: 'clawstr',
    name: 'Clawstr',
    supply: 150,
    price: '0.0234',
    priceChange24h: 12.5,
    sourceVerified: true,
    clawsVerified: true,
  },
  {
    address: '0x0000000000000000000000000000000000000002',
    xHandle: 'kellyclaude',
    name: 'KellyClaude',
    supply: 89,
    price: '0.0156',
    priceChange24h: -3.2,
    sourceVerified: true,
    clawsVerified: false,
  },
  {
    address: '0x0000000000000000000000000000000000000003',
    xHandle: 'starkbot',
    name: 'StarkBot',
    supply: 67,
    price: '0.0098',
    priceChange24h: 8.7,
    sourceVerified: true,
    clawsVerified: true,
  },
];

export function AgentList() {
  const agents = MOCK_AGENTS;

  if (agents.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        No agents yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <AgentCard key={agent.address} agent={agent} />
      ))}
    </div>
  );
}
