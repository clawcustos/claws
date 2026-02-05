'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { TradeModal } from '@/components/trade-modal';
import { PriceChart } from '@/components/price-chart';
import { getAgent, getAgentEmoji, formatETH, calculateCurrentPrice } from '@/lib/agents';

// ETH price for USD estimates
const ETH_PRICE_USD = 3000;

function formatUSD(eth: number): string {
  const usd = eth * ETH_PRICE_USD;
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(1)}K`;
}

export default function AgentPage() {
  const params = useParams();
  const handle = (params.handle as string).toLowerCase();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  
  const agent = getAgent(handle);
  const emoji = getAgentEmoji(handle);
  
  if (!agent) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="empty-state" style={{ marginTop: '4rem' }}>
            <div className="empty-state-icon">🔍</div>
            <h2 className="empty-state-title">Agent not found</h2>
            <p className="empty-state-desc">This agent doesn't exist or hasn't been added yet.</p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Back to Home
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const priceETH = agent.priceETH;

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{agent.name}</span>
        </nav>
        
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar" style={{ 
            boxShadow: agent.isVerified ? '0 0 30px -5px var(--brand-glow)' : 'none',
            border: agent.isVerified ? '2px solid var(--brand)' : '2px solid var(--border)',
          }}>
            {emoji}
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">
              {agent.name}
              {agent.isVerified && (
                <span 
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '22px',
                    height: '22px',
                    background: 'var(--brand)',
                    borderRadius: '50%',
                    fontSize: '0.75rem',
                    color: 'white',
                  }}
                  title="Verified Agent"
                >
                  ✓
                </span>
              )}
            </h1>
            <div className="profile-handle">
              <a 
                href={`https://x.com/${agent.xHandle}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                @{agent.xHandle} ↗
              </a>
            </div>
            <div className="profile-address mono">
              {agent.address.slice(0, 10)}...{agent.address.slice(-8)}
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value mono">{formatETH(priceETH)} Ξ</div>
            <div className="profile-stat-label">Price</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value mono">{agent.supply}</div>
            <div className="profile-stat-label">Supply</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value mono">{agent.holders}</div>
            <div className="profile-stat-label">Holders</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value mono">{formatETH(agent.lifetimeVolumeETH)} Ξ</div>
            <div className="profile-stat-label">Volume</div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="profile-main">
          {/* Left Column */}
          <div>
            {/* About */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">About</h2>
              </div>
              <div className="card">
                <div className="card-body">
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{agent.description}</p>
                </div>
              </div>
            </section>
            
            {/* Price Chart */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">Price History</h2>
              </div>
              <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                  <PriceChart 
                    currentPrice={priceETH * ETH_PRICE_USD} 
                    priceChange24h={agent.priceChange24h}
                    height={220}
                  />
                </div>
              </div>
            </section>
            
            {/* Recent Trades */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">Recent Trades</h2>
              </div>
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📜</div>
                  <div className="empty-state-title">No trades yet</div>
                  <div className="empty-state-desc">Be the first to trade {agent.name} claws</div>
                </div>
              </div>
            </section>
            
            {/* Top Holders */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">Top Holders</h2>
              </div>
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <div className="empty-state-title">No holders yet</div>
                  <div className="empty-state-desc">Buy claws to appear on the leaderboard</div>
                </div>
              </div>
            </section>
          </div>
          
          {/* Right Column - Trade Panel */}
          <div>
            <div className="trade-panel glow-hover" style={{ position: 'sticky', top: 'calc(var(--header-height) + 1.5rem)' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div 
                  style={{ 
                    width: '44px', 
                    height: '44px', 
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  {emoji}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{agent.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    @{agent.xHandle}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ 
                  background: 'var(--bg-elevated)', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}>
                  <div className="mono" style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                    {formatETH(priceETH)} Ξ
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Price
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {formatUSD(priceETH)}
                  </div>
                </div>
                <div style={{ 
                  background: 'var(--bg-elevated)', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}>
                  <div className="mono" style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                    {agent.supply}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Supply
                  </div>
                </div>
              </div>
              
              {/* Trade Button */}
              <button 
                className="btn btn-primary btn-lg hover-lift" 
                style={{ width: '100%', marginBottom: '0.75rem' }}
                onClick={() => setIsTradeModalOpen(true)}
              >
                Trade {agent.name}
              </button>
              
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)', 
                textAlign: 'center',
                margin: 0,
              }}>
                5% fee to protocol • 5% fee to agent
              </p>
              
              {/* Agent Stats */}
              <div 
                style={{ 
                  marginTop: '1.25rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Agent Stats
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Lifetime Volume</span>
                    <span className="mono">{formatETH(agent.lifetimeVolumeETH)} Ξ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Lifetime Fees</span>
                    <span className="mono">{formatETH(agent.lifetimeFeesETH)} Ξ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Pending Fees</span>
                    <span className="mono" style={{ color: agent.pendingFeesETH > 0 ? 'var(--positive)' : 'inherit' }}>
                      {formatETH(agent.pendingFeesETH)} Ξ
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Verified</span>
                    <span style={{ color: agent.isVerified ? 'var(--positive)' : 'var(--text-muted)' }}>
                      {agent.isVerified ? 'Yes ✓' : 'Not yet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
      
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        agentName={agent.name}
        agentHandle={agent.xHandle}
        currentPriceETH={priceETH}
        supply={agent.supply}
      />
    </div>
  );
}
