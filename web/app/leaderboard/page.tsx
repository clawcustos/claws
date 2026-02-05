'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';

// Full agent data
const ALL_AGENTS = [
  { address: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b' as const, xHandle: 'bankrbot', name: 'Bankr', supply: 234, price: '52.10', volume24h: '$12.4K', lifetimeVolume: '$423.5K', holders: 89, clawsVerified: true },
  { address: '0xB695559b26BB2c9703ef1935c37AeaE9526bab07' as const, xHandle: 'moltbook', name: 'Moltbook', supply: 189, price: '41.20', volume24h: '$8.9K', lifetimeVolume: '$312.1K', holders: 67, clawsVerified: true },
  { address: '0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07' as const, xHandle: 'clawdbotatg', name: 'Clawd ATG', supply: 156, price: '29.80', volume24h: '$5.2K', lifetimeVolume: '$187.4K', holders: 52, clawsVerified: true },
  { address: '0xa1f72459dfa10bad200ac160ecd78c6b77a747be' as const, xHandle: 'clawnch', name: 'CLAWNCH', supply: 142, price: '26.70', volume24h: '$3.8K', lifetimeVolume: '$145.2K', holders: 45, clawsVerified: false },
  { address: '0x50D2280441372486BeecdD328c1854743EBaCb07' as const, xHandle: 'kellyclaudeai', name: 'KellyClaude', supply: 98, price: '18.90', volume24h: '$2.1K', lifetimeVolume: '$78.9K', holders: 34, clawsVerified: true },
  { address: '0x587Cd533F418825521f3A1daa7CCd1E7339A1B07' as const, xHandle: 'starkbotai', name: 'StarkBot', supply: 87, price: '15.60', volume24h: '$1.5K', lifetimeVolume: '$56.7K', holders: 28, clawsVerified: true },
  { address: '0x0000000000000000000000000000000000000000' as const, xHandle: 'clawcustos', name: 'Custos', supply: 45, price: '8.20', volume24h: '$980', lifetimeVolume: '$12.4K', holders: 18, clawsVerified: false },
  { address: '0x81bE0217E166182D35B21E7d65D2b2bb7EA4Cb07' as const, xHandle: 'clawstr', name: 'Clawstr', supply: 76, price: '13.40', volume24h: '$1.2K', lifetimeVolume: '$34.5K', holders: 24, clawsVerified: false },
  { address: '0x62bA0344E51Ff12C3a7f76f90A2A0d7B03a1Cb07' as const, xHandle: 'molten', name: 'Molten', supply: 65, price: '11.80', volume24h: '$890', lifetimeVolume: '$28.3K', holders: 21, clawsVerified: false },
  { address: '0x71dA8956E87F55E6DDBf8C09C3B1BAD1E8e5Db07' as const, xHandle: 'clawdvine', name: 'ClawdVine', supply: 54, price: '9.90', volume24h: '$670', lifetimeVolume: '$21.5K', holders: 17, clawsVerified: false },
];

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
};

type SortMetric = 'price' | 'volume' | 'holders' | 'supply';

export default function LeaderboardPage() {
  const [metric, setMetric] = useState<SortMetric>('price');
  
  // Sort agents by selected metric
  const sortedAgents = [...ALL_AGENTS].sort((a, b) => {
    switch (metric) {
      case 'price':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'volume':
        return parseFloat(b.lifetimeVolume.replace(/[$K]/g, '')) - parseFloat(a.lifetimeVolume.replace(/[$K]/g, ''));
      case 'holders':
        return b.holders - a.holders;
      case 'supply':
        return b.supply - a.supply;
      default:
        return 0;
    }
  });

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
            const emoji = AGENT_EMOJIS[agent.xHandle] || '🤖';
            
            return (
              <Link 
                key={agent.address} 
                href={`/agent/${agent.xHandle}`}
                className="leaderboard-item"
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
                      {agent.clawsVerified && ' ✓'}
                    </div>
                    <div className="leaderboard-agent-handle">@{agent.xHandle}</div>
                  </div>
                </div>
                
                <div className="leaderboard-price">${agent.price}</div>
                <div className="leaderboard-supply">{agent.supply}</div>
                <div className="leaderboard-volume">{agent.lifetimeVolume}</div>
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
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand)' }}>
                $1.3M
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Total Volume
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--positive)' }}>
                395
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Total Holders
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                1,146
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Total Supply
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                6 / 21
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Verified
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
