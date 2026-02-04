'use client';

import { AgentCardCompact } from './agent-card';
import { Agent } from '@/lib/types';

// Mock data - replace with real data from indexer
const MOCK_TOP_AGENTS: Agent[] = [];

export function Leaderboard() {
  // TODO: Fetch from indexer/API, sorted by volume/price/earnings
  const agents = MOCK_TOP_AGENTS;

  if (agents.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="text-center text-gray-500 py-4">
          <div className="text-2xl mb-2">🏆</div>
          <p>Leaderboard empty</p>
          <p className="text-sm mt-1">Create a market to appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {agents.map((agent, index) => (
        <AgentCardCompact key={agent.address} agent={agent} rank={index + 1} />
      ))}
    </div>
  );
}
