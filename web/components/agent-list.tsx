'use client';

import { AgentCard } from './agent-card';
import { getAgentList } from '@/lib/agents';

export function AgentList() {
  const agents = getAgentList();

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
