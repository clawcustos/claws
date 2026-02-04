'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';

// Mock holdings data - will be replaced with contract reads
const MOCK_HOLDINGS = [
  { agent: '0x1111', name: 'Clawstr', xHandle: 'clawstr', balance: 5, currentPrice: '0.0234', value: '0.117', pnl: 23.5, verified: true },
  { agent: '0x2222', name: 'KellyClaude', xHandle: 'kellyclaude', balance: 3, currentPrice: '0.0189', value: '0.0567', pnl: -8.2, verified: true },
  { agent: '0x4444', name: 'MoltX', xHandle: 'moltx', balance: 8, currentPrice: '0.0134', value: '0.1072', pnl: 45.1, verified: true },
];

const MOCK_ACTIVITY = [
  { type: 'buy', agent: 'Clawstr', amount: 2, price: '0.0198', time: '2h ago' },
  { type: 'sell', agent: 'StarkBot', amount: 1, price: '0.0145', time: '5h ago' },
  { type: 'buy', agent: 'MoltX', amount: 5, price: '0.0089', time: '1d ago' },
];

export default function ClawfolioPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'holdings' | 'activity'>('holdings');

  // Calculate totals from mock data
  const totalValue = MOCK_HOLDINGS.reduce((sum, h) => sum + parseFloat(h.value), 0);
  const totalPnl = 18.7; // Mock overall P&L

  if (!isConnected) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="main-content" style={{ paddingBottom: '80px' }}>
          <div className="clawfolio-connect">
            <div className="connect-prompt">
              <h1>Your Clawfolio</h1>
              <p>Connect your wallet to view your claw holdings and activity.</p>
              <div className="connect-illustration">🦞</div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content" style={{ paddingBottom: '80px' }}>
        <div className="clawfolio-page">
          {/* Portfolio Summary */}
          <div className="portfolio-summary">
            <div className="portfolio-header">
              <h1>Your Clawfolio</h1>
              <span className="wallet-address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            
            <div className="portfolio-stats">
              <div className="portfolio-stat main">
                <span className="stat-label">Total Value</span>
                <span className="stat-value">Ξ{totalValue.toFixed(4)}</span>
              </div>
              <div className="portfolio-stat">
                <span className="stat-label">Total P&L</span>
                <span className={`stat-value ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl}%
                </span>
              </div>
              <div className="portfolio-stat">
                <span className="stat-label">Holdings</span>
                <span className="stat-value">{MOCK_HOLDINGS.length} agents</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="clawfolio-tabs">
            <button 
              className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
              onClick={() => setActiveTab('holdings')}
            >
              Holdings
            </button>
            <button 
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>

          {/* Holdings Tab */}
          {activeTab === 'holdings' && (
            <div className="holdings-list">
              {MOCK_HOLDINGS.length === 0 ? (
                <div className="empty-state">
                  <p>No claws yet. Start speculating!</p>
                  <Link href="/" className="cta-link">Browse Agents →</Link>
                </div>
              ) : (
                MOCK_HOLDINGS.map((holding) => (
                  <Link 
                    key={holding.agent} 
                    href={`/agent/${holding.agent}`}
                    className="holding-card"
                  >
                    <div className="holding-agent">
                      <Image
                        src={`https://unavatar.io/twitter/${holding.xHandle}`}
                        alt={holding.name}
                        width={44}
                        height={44}
                        className="holding-avatar"
                        unoptimized
                      />
                      <div className="holding-info">
                        <span className="holding-name">
                          {holding.name}
                          {holding.verified && <span className="verified-tick">✓</span>}
                        </span>
                        <span className="holding-handle">@{holding.xHandle}</span>
                      </div>
                    </div>
                    <div className="holding-stats">
                      <div className="holding-balance">
                        <span className="balance-value">{holding.balance}</span>
                        <span className="balance-label">claws</span>
                      </div>
                      <div className="holding-value">
                        <span className="value-amount">Ξ{holding.value}</span>
                        <span className={`value-pnl ${holding.pnl >= 0 ? 'positive' : 'negative'}`}>
                          {holding.pnl >= 0 ? '+' : ''}{holding.pnl}%
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="activity-list">
              {MOCK_ACTIVITY.length === 0 ? (
                <div className="empty-state">
                  <p>No activity yet.</p>
                </div>
              ) : (
                MOCK_ACTIVITY.map((activity, i) => (
                  <div key={i} className="activity-row">
                    <div className={`activity-type ${activity.type}`}>
                      {activity.type === 'buy' ? '↑' : '↓'}
                    </div>
                    <div className="activity-details">
                      <span className="activity-action">
                        {activity.type === 'buy' ? 'Bought' : 'Sold'} {activity.amount} {activity.agent}
                      </span>
                      <span className="activity-price">@ Ξ{activity.price}</span>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
