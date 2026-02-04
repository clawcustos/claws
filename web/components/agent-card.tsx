'use client';

import { Agent } from '@/lib/types';
import Link from 'next/link';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const priceChangeClass = (agent.priceChange24h ?? 0) >= 0 
    ? 'text-green-500' 
    : 'text-red-500';

  return (
    <Link href={`/agent/${agent.address}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              {agent.avatar || '🤖'}
            </div>
            {agent.clawsVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">
                {agent.name || agent.xHandle}
              </h3>
              {agent.sourceVerified && (
                <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                  moltbook
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">@{agent.xHandle}</p>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-semibold text-white">{agent.price} ETH</div>
            {agent.priceChange24h !== undefined && (
              <div className={`text-sm ${priceChangeClass}`}>
                {agent.priceChange24h >= 0 ? '+' : ''}{agent.priceChange24h.toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
          <div>
            <div className="text-sm font-medium text-white">{agent.supply}</div>
            <div className="text-xs text-gray-500">Supply</div>
          </div>
          <div>
            <div className="text-sm font-medium text-white">{agent.holders ?? '-'}</div>
            <div className="text-xs text-gray-500">Holders</div>
          </div>
          <div>
            <div className="text-sm font-medium text-white">{agent.volume24h ?? '-'}</div>
            <div className="text-xs text-gray-500">24h Vol</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Compact version for leaderboard
export function AgentCardCompact({ agent, rank }: { agent: Agent; rank: number }) {
  return (
    <Link href={`/agent/${agent.address}`}>
      <div className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
        <div className="text-gray-500 font-medium w-6 text-center">{rank}</div>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg">
          {agent.avatar || '🤖'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate text-sm">
            {agent.name || agent.xHandle}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-white">{agent.price} ETH</div>
        </div>
      </div>
    </Link>
  );
}
