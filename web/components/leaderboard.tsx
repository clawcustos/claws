'use client';

import Link from 'next/link';
import { type AgentListItem, getAgentEmoji, formatETH } from '@/lib/agents';

interface LeaderboardProps {
  agents: AgentListItem[];
}

export function Leaderboard({ agents }: LeaderboardProps) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">🏆 Leaderboard</h2>
        <Link href="/leaderboard" className="section-action">Full rankings →</Link>
      </div>
      
      <div className="leaderboard">
        <div className="leaderboard-header">
          <div className="leaderboard-col rank">#</div>
          <div className="leaderboard-col agent">Agent</div>
          <div className="leaderboard-col price">Price</div>
          <div className="leaderboard-col supply">Supply</div>
          <div className="leaderboard-col volume">24h Vol</div>
        </div>
        
        {agents.map((agent, index) => {
          const emoji = getAgentEmoji(agent.xHandle);
          const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
          
          return (
            <Link 
              key={agent.address} 
              href={`/agent/${agent.xHandle}`}
              className="leaderboard-item hover-lift"
            >
              <div className="leaderboard-rank">
                <span className={`rank-badge ${rankClass}`}>
                  {index + 1}
                </span>
              </div>
              
              <div className="leaderboard-agent">
                <div className="leaderboard-avatar">{emoji}</div>
                <div className="leaderboard-agent-info">
                  <div className="leaderboard-agent-name">
                    {agent.name}
                    {agent.clawsVerified && (
                      <span 
                        style={{ 
                          marginLeft: '0.375rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '14px',
                          height: '14px',
                          background: 'var(--brand)',
                          borderRadius: '50%',
                          fontSize: '0.5rem',
                          color: 'white',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="leaderboard-agent-handle">@{agent.xHandle}</div>
                </div>
              </div>
              
              <div className="leaderboard-price">
                {formatETH(agent.priceETH)} Ξ
              </div>
              
              <div className="leaderboard-supply">
                {agent.supply}
              </div>
              
              <div className="leaderboard-volume">
                {agent.volume24h}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
