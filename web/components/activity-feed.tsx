'use client';

import Link from 'next/link';
import { getAgentEmoji } from '@/lib/agents';

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  agent: {
    handle: string;
    name: string;
  };
  trader: string;
  amount: number;
  price: string;
  timestamp: Date;
}

// Mock recent trades
const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    type: 'buy',
    agent: { handle: 'bankrbot', name: 'Bankr' },
    trader: '0x742d...3a1b',
    amount: 5,
    price: '$287.50',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: '2',
    type: 'sell',
    agent: { handle: 'moltbook', name: 'Moltbook' },
    trader: '0x8f21...c4e9',
    amount: 3,
    price: '$124.20',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: '3',
    type: 'buy',
    agent: { handle: 'clawcustos', name: 'Custos' },
    trader: '0x1a3f...7b2d',
    amount: 10,
    price: '$98.40',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '4',
    type: 'buy',
    agent: { handle: 'kellyclaudeai', name: 'KellyClaude' },
    trader: '0x5e6a...9f4c',
    amount: 2,
    price: '$38.60',
    timestamp: new Date(Date.now() - 23 * 60 * 1000),
  },
  {
    id: '5',
    type: 'sell',
    agent: { handle: 'starkbotai', name: 'StarkBot' },
    trader: '0x3c8b...2d1e',
    amount: 8,
    price: '$125.80',
    timestamp: new Date(Date.now() - 31 * 60 * 1000),
  },
];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function ActivityFeed() {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="activity-pulse" />
          Recent Activity
        </h2>
        <span className="section-action" style={{ color: 'var(--positive)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ 
            width: '6px', 
            height: '6px', 
            background: 'var(--positive)', 
            borderRadius: '50%',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          Live
        </span>
      </div>
      
      <div className="activity-list">
        {MOCK_TRADES.map((trade) => {
          const emoji = getAgentEmoji(trade.agent.handle);
          
          return (
            <Link 
              key={trade.id} 
              href={`/agent/${trade.agent.handle}`}
              className="activity-item"
            >
              <div className={`activity-icon ${trade.type}`}>
                {trade.type === 'buy' ? '↑' : '↓'}
              </div>
              
              <div className="activity-avatar">
                {emoji}
              </div>
              
              <div className="activity-content">
                <div className="activity-text">
                  <span className="activity-trader">{trade.trader}</span>
                  {' '}
                  <span className={trade.type === 'buy' ? 'text-positive' : 'text-negative'}>
                    {trade.type === 'buy' ? 'bought' : 'sold'}
                  </span>
                  {' '}
                  <strong>{trade.amount}</strong>
                  {' '}
                  <span className="activity-agent">{trade.agent.name}</span>
                </div>
                <div className="activity-time">{timeAgo(trade.timestamp)}</div>
              </div>
              
              <div className="activity-amount mono">
                {trade.price}
              </div>
            </Link>
          );
        })}
      </div>
      
      <style jsx>{`
        .activity-pulse {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: var(--positive);
          border-radius: 50%;
          margin-right: 0.5rem;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .activity-avatar {
          width: 32px;
          height: 32px;
          background: var(--bg-elevated);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        
        .activity-trader {
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 0.8125rem;
        }
        
        .activity-agent {
          color: var(--brand);
          font-weight: 500;
        }
        
        .text-positive {
          color: var(--positive);
        }
        
        .text-negative {
          color: var(--negative);
        }
      `}</style>
    </section>
  );
}
