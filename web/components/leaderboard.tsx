'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { Agent } from '@/lib/types';

interface LeaderboardProps {
  agents: Agent[];
  title?: string;
}

export function Leaderboard({ agents, title = 'Top Agents' }: LeaderboardProps) {
  if (agents.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center">
        <Icons.Trophy size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
        <p className="text-[var(--text-muted)]">No agents yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {agents.slice(0, 10).map((agent, index) => (
          <Link
            key={agent.address}
            href={`/agent/${agent.address}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors"
          >
            <span className="w-6 text-center text-[var(--text-muted)] font-medium">
              {index + 1}
            </span>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Icons.User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-sm">{agent.name || agent.xHandle}</div>
            </div>
            <div className="text-sm font-medium">{agent.price} ETH</div>
            <Icons.ChevronRight size={16} className="text-[var(--text-muted)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
