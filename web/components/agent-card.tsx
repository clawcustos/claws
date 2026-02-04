'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { Agent } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const isPositive = (agent.priceChange24h ?? 0) >= 0;
  
  return (
    <Link href={`/agent/${agent.address}`}>
      <div className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-4 transition-colors">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Icons.User size={24} className="text-white" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{agent.name || agent.xHandle}</div>
            <div className="text-[var(--text-muted)] text-sm">@{agent.xHandle}</div>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <div className="font-semibold">{agent.price} ETH</div>
            <div className={`text-sm flex items-center justify-end gap-1 ${isPositive ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
              {isPositive ? <Icons.TrendingUp size={14} /> : <Icons.TrendingDown size={14} />}
              {isPositive ? '+' : ''}{agent.priceChange24h?.toFixed(1) ?? 0}%
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
