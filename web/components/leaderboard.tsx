'use client';

import Link from 'next/link';
import { Agent } from '@/lib/types';

interface LeaderboardProps {
  agents: Agent[];
  title?: string;
}

export function Leaderboard({ agents, title = 'Top Agents' }: LeaderboardProps) {
  if (agents.length === 0) {
    return (
      <div className="leaderboard-section">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
        </div>
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center', 
          background: 'var(--color-surface)',
          borderRadius: '12px',
          color: 'var(--color-secondary)'
        }}>
          No agents yet
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link href="/leaderboard" className="section-link">View all →</Link>
      </div>
      
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th className="rank-col">#</th>
            <th className="agent-col">Agent</th>
            <th className="price-col">Price</th>
            <th className="holders-col">Holders</th>
            <th className="change-col">24h</th>
          </tr>
        </thead>
        <tbody>
          {agents.slice(0, 10).map((agent, index) => {
            const priceChange = agent.priceChange24h ?? 0;
            const isPositive = priceChange >= 0;
            const initial = (agent.name || agent.xHandle || '?')[0].toUpperCase();
            
            return (
              <tr key={agent.address} className={index < 3 ? 'top-rank' : ''}>
                <td>
                  <span className={`rank-badge ${index < 3 ? 'rank-top' : ''}`}>
                    {index + 1}
                  </span>
                </td>
                <td>
                  <Link href={`/agent/${agent.address}`} className="agent-link">
                    <div className="leaderboard-avatar">{initial}</div>
                    <span className="agent-handle-text">
                      {agent.name || agent.xHandle}
                      {agent.clawsVerified && ' ✓'}
                    </span>
                  </Link>
                </td>
                <td className="price-cell">Ξ{agent.price}</td>
                <td className="holders-cell">{agent.supply}</td>
                <td className={`change-cell ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
