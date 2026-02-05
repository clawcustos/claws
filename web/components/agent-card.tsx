'use client';

import Link from 'next/link';
import { formatETH } from '@/lib/agents';

interface Agent {
  address: `0x${string}`;
  xHandle: string;
  name: string;
  supply: number;
  priceETH: number;
  priceUSD: string;
  priceChange24h: number;
  volume24h?: string;
  sourceVerified?: boolean;
  clawsVerified?: boolean;
}

interface AgentCardProps {
  agent: Agent;
}

const AGENT_EMOJIS: Record<string, string> = {
  bankrbot: '💰',
  moltbook: '🦀',
  clawdbotatg: '🦞',
  clawnch: '🚀',
  kellyclaudeai: '🤖',
  starkbotai: '⚡',
  clawcustos: '🏛️',
  clawstr: '🦞',
  molten: '🔥',
  clawdvine: '🍇',
  clawdia: '✨',
  clawcaster: '📡',
  lobchanai: '🦞',
  solvrbot: '🔧',
  moltcaster: '📺',
};

export function AgentCard({ agent }: AgentCardProps) {
  const emoji = AGENT_EMOJIS[agent.xHandle.toLowerCase()] || '🤖';
  const isPositive = agent.priceChange24h >= 0;
  
  return (
    <Link href={`/agent/${agent.xHandle}`} className="agent-card">
      {/* Glow effect for verified agents */}
      {agent.clawsVerified && (
        <div 
          className="agent-card-glow"
          style={{
            position: 'absolute',
            inset: '-1px',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      
      <div className="agent-card-top" style={{ position: 'relative', zIndex: 1 }}>
        <div className="agent-avatar">
          {emoji}
        </div>
        
        <div className="agent-info" style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
          <div className="agent-name-row">
            <span className="agent-name">{agent.name}</span>
            {agent.clawsVerified && (
              <span className="badge badge-verified" title="Verified Agent">✓</span>
            )}
            {agent.sourceVerified && !agent.clawsVerified && (
              <span className="badge badge-pending" title="Pending Verification">○</span>
            )}
          </div>
          <div className="agent-handle">@{agent.xHandle}</div>
        </div>
        
        <div className="agent-price">
          <div className="agent-price-value">{formatETH(agent.priceETH)} Ξ</div>
          <div className="agent-price-usd">{agent.priceUSD}</div>
        </div>
      </div>
      
      <div className="agent-card-stats" style={{ position: 'relative', zIndex: 1 }}>
        <div className="agent-stat">
          <div className="agent-stat-value">{agent.supply}</div>
          <div className="agent-stat-label">Supply</div>
        </div>
        <div className="agent-stat">
          <div className="agent-stat-value">{agent.volume24h || '-'}</div>
          <div className="agent-stat-label">24h Vol</div>
        </div>
        <div className="agent-stat">
          <div className={`agent-stat-value ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? '↑' : '↓'}{Math.abs(agent.priceChange24h).toFixed(1)}%
          </div>
          <div className="agent-stat-label">24h</div>
        </div>
      </div>
    </Link>
  );
}
