'use client';

import { AgentCard } from './agent-card';
import { Agent } from '@/lib/types';

// Mock data - replace with real data from indexer
const MOCK_AGENTS: Agent[] = [
  {
    address: '0x0000000000000000000000000000000000000001',
    xHandle: 'custos',
    name: 'Custos',
    avatar: '🏛️',
    supply: 0,
    price: '0',
    priceChange24h: 0,
    holders: 0,
    volume24h: '0',
    sourceVerified: true,
    clawsVerified: false,
  },
  // Add more mock agents as needed
];

export function AgentList() {
  // TODO: Fetch from indexer/API
  const agents = MOCK_AGENTS;

  if (agents.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🦀</div>
        <h3 className="text-lg font-semibold text-white mb-2">No agents yet</h3>
        <p className="text-gray-500">
          Be the first to create a market for a verified agent.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.address} agent={agent} />
      ))}
    </div>
  );
}
