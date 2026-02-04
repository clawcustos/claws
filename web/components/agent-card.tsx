'use client';

import Link from 'next/link';
import { Agent } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const priceChange = agent.priceChange24h ?? 0;
  const isPositive = priceChange >= 0;
  const initial = (agent.name || agent.xHandle || '?')[0].toUpperCase();
  
  return (
    <Link href={`/agent/${agent.address}`} className="agent-card">
      <div className="agent-card-header">
        <div className="agent-avatar">
          <span className="agent-avatar-placeholder">{initial}</span>
        </div>
        <div className="agent-info">
          <h3 className="agent-name">
            {agent.name || agent.xHandle}
            {agent.clawsVerified && <span className="verification-badge" title="Verified">✓</span>}
          </h3>
          <span className="agent-handle">@{agent.xHandle}</span>
        </div>
      </div>
      
      <div className="agent-stats">
        <div className="agent-stat">
          <span className="agent-stat-value">Ξ{agent.price}</span>
          <span className="agent-stat-label">Price</span>
        </div>
        <div className="agent-stat">
          <span className="agent-stat-value">{agent.supply}</span>
          <span className="agent-stat-label">Holders</span>
        </div>
        <div className="agent-stat">
          <span className={`agent-stat-value ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
          </span>
          <span className="agent-stat-label">24h</span>
        </div>
      </div>
    </Link>
  );
}
