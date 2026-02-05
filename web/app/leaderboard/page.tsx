'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { getAgentList, getAgentEmoji, AGENTS, formatETH } from '@/lib/agents';

type SortMetric = 'price' | 'volume' | 'holders' | 'supply';

export default function LeaderboardPage() {
  const [metric, setMetric] = useState<SortMetric>('price');
  
  const allAgents = useMemo(() => {
    // Get list items and enrich with additional data
    return getAgentList().map(agent => {
      const fullAgent = AGENTS[agent.xHandle.toLowerCase()];
      return {
        ...agent,
        lifetimeVolumeETH: fullAgent?.lifetimeVolumeETH || 0,
        holders: fullAgent?.holders || 0,
      };
    });
  }, []);
  
  // Sort agents by selected metric
  const sortedAgents = useMemo(() => {
    return [...allAgents].sort((a, b) => {
      switch (metric) {
        case 'price':
          return b.priceETH - a.priceETH;
        case 'volume':
          return b.lifetimeVolumeETH - a.lifetimeVolumeETH;
        case 'holders':
          return b.holders - a.holders;
        case 'supply':
          return b.supply - a.supply;
        default:
          return 0;
      }
    });
  }, [allAgents, metric]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalVolume = allAgents.reduce((acc, a) => acc + a.lifetimeVolumeETH, 0);
    const totalHolders = allAgents.reduce((acc, a) => acc + a.holders, 0);
    const totalSupply = allAgents.reduce((acc, a) => acc + a.supply, 0);
    const verifiedCount = allAgents.filter(a => a.clawsVerified).length;
    
    return { totalVolume, totalHolders, totalSupply, verifiedCount, totalAgents: allAgents.length };
  }, [allAgents]);

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🏆 Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Top AI agents ranked by {metric === 'price' ? 'market price' : metric === 'volume' ? 'lifetime trading volume' : metric === 'holders' ? 'number of holders' : 'supply'}.
          </p>
        </div>
        
        {/* Metric Tabs */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '0.25rem', 
            marginBottom: '1.5rem',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: '0.25rem',
            width: 'fit-content',
          }}
        >
          {([
            { key: 'price', label: 'Price' },
            { key: 'volume', label: 'Volume' },
            { key: 'holders', label: 'Holders' },
            { key: 'supply', label: 'Supply' },
          ] as { key: SortMetric; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: metric === key ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: metric === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                boxShadow: metric === key ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Leaderboard Table */}
        <div className="leaderboard">
          <div className="leaderboard-header">
            <div className="leaderboard-col rank">#</div>
            <div className="leaderboard-col agent">Agent</div>
            <div className="leaderboard-col price">Price</div>
            <div className="leaderboard-col supply">Supply</div>
            <div className="leaderboard-col volume">Volume</div>
          </div>
          
          {sortedAgents.map((agent, index) => {
            const rank = index + 1;
            const emoji = getAgentEmoji(agent.xHandle);
            
            return (
              <Link 
                key={agent.address} 
                href={`/agent/${agent.xHandle}`}
                className="leaderboard-item hover-lift"
              >
                <div className="leaderboard-rank">
                  <span className={`rank-badge ${getRankClass(rank)}`}>
                    {rank}
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
                
                <div className="leaderboard-price">{formatETH(agent.priceETH)} Ξ</div>
                <div className="leaderboard-supply">{agent.supply}</div>
                <div className="leaderboard-volume">{formatETH(agent.lifetimeVolumeETH)} Ξ</div>
              </Link>
            );
          })}
        </div>
        
        {/* Stats Summary */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          <div className="card glow-hover">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand)' }}>
                {formatETH(totals.totalVolume)} Ξ
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Total Volume
              </div>
            </div>
          </div>
          
          <div className="card glow-hover">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--positive)' }}>
                {totals.totalHolders}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Total Holders
              </div>
            </div>
          </div>
          
          <div className="card glow-hover">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {totals.totalSupply}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Total Supply
              </div>
            </div>
          </div>
          
          <div className="card glow-hover">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {totals.verifiedCount} / {totals.totalAgents}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Verified Agents
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
