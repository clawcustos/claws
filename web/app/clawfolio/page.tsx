'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AGENTS, formatETH, formatUSD, calculateCurrentPrice } from '@/lib/agents';
import { TradeModal } from '@/components/trade-modal';

// Mock holdings data (will be replaced with real contract reads)
const MOCK_HOLDINGS = [
  { handle: 'bankrbot', amount: 5, avgBuyPrice: 0.145 },
  { handle: 'moltbook', amount: 3, avgBuyPrice: 0.098 },
  { handle: 'clawnch_bot', amount: 8, avgBuyPrice: 0.042 },
  { handle: 'clawdbotatg', amount: 2, avgBuyPrice: 0.071 },
];

// Bottom Navigation Component (Mobile)
function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--black-surface)',
      borderTop: '1px solid var(--grey-800)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      <Link href="/" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: 'var(--grey-400)',
        textDecoration: 'none',
        fontSize: '0.6875rem',
        padding: '0.5rem',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        Home
      </Link>
      <Link href="/#agents" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: 'var(--grey-400)',
        textDecoration: 'none',
        fontSize: '0.6875rem',
        padding: '0.5rem',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4"/>
          <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        </svg>
        Agents
      </Link>
      <Link href="/#leaderboard" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: 'var(--grey-400)',
        textDecoration: 'none',
        fontSize: '0.6875rem',
        padding: '0.5rem',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
          <polyline points="17,6 23,6 23,12"/>
        </svg>
        Trending
      </Link>
      <Link href="/clawfolio" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: 'var(--red)',
        textDecoration: 'none',
        fontSize: '0.6875rem',
        padding: '0.5rem',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M6 8h.01M6 12h.01M6 16h.01"/>
          <path d="M10 8h8M10 12h8M10 16h8"/>
        </svg>
        Clawfolio
      </Link>
    </nav>
  );
}

export default function ClawfolioPage() {
  const { address, isConnected } = useAccount();
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
    mode: 'buy' | 'sell';
  }>({ isOpen: false, handle: '', mode: 'buy' });

  // Calculate portfolio stats
  const holdings = MOCK_HOLDINGS.map(h => {
    const agent = Object.values(AGENTS).find(a => a.xHandle.toLowerCase() === h.handle.toLowerCase());
    if (!agent) return null;
    const currentPrice = calculateCurrentPrice(agent.supply);
    const value = h.amount * currentPrice;
    const costBasis = h.amount * h.avgBuyPrice;
    const pnl = value - costBasis;
    const pnlPercent = (pnl / costBasis) * 100;
    return { ...h, agent, currentPrice, value, pnl, pnlPercent };
  }).filter(Boolean);

  const totalValue = holdings.reduce((acc, h) => acc + (h?.value || 0), 0);
  const totalPnL = holdings.reduce((acc, h) => acc + (h?.pnl || 0), 0);
  
  const selectedAgent = AGENTS[tradeModal.handle] || 
    Object.values(AGENTS).find(a => a.xHandle.toLowerCase() === tradeModal.handle.toLowerCase());

  const openTrade = (handle: string, mode: 'buy' | 'sell') => {
    setTradeModal({ isOpen: true, handle, mode });
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/logo.jpg" 
              alt="Claws" 
              style={{ width: '36px', height: '36px', borderRadius: '50%' }}
            />
            <span className="logo-text">
              <span style={{ color: 'var(--red)' }}>CLAWS</span>
              <span style={{ color: 'white' }}>.TECH</span>
            </span>
            <span style={{
              padding: '0.2rem 0.5rem',
              background: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid var(--red)',
              borderRadius: '4px',
              color: 'var(--red)',
              fontSize: '0.625rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}>
              BETA v0.0.1
            </span>
          </Link>
          
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                  {!connected ? (
                    <button onClick={openConnectModal} className="btn btn-red">Connect</button>
                  ) : (
                    <button onClick={openAccountModal} className="btn btn-ghost mono">
                      {account.displayName}
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      <main className="main" style={{ paddingTop: 'var(--header-height)', paddingBottom: '5rem' }}>
        <section className="section" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Your <span className="text-red">Clawfolio</span>
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            Track and manage your claw holdings.
          </p>
          
          {!isConnected ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦞</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Connect Your Wallet</h2>
              <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem' }}>
                Connect your wallet to see your claws.
              </p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button onClick={openConnectModal} className="btn btn-red">
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          ) : (
            <>
              {/* Portfolio Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}>
                <div style={{
                  background: 'var(--black-surface)',
                  border: '1px solid var(--grey-800)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}>
                  <div style={{ color: 'var(--grey-500)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    TOTAL VALUE
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                    {formatETH(totalValue)} ETH
                  </div>
                  <div style={{ color: 'var(--grey-500)', fontSize: '0.875rem' }}>
                    {formatUSD(totalValue)}
                  </div>
                </div>
                <div style={{
                  background: 'var(--black-surface)',
                  border: '1px solid var(--grey-800)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}>
                  <div style={{ color: 'var(--grey-500)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    TOTAL P&L
                  </div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600,
                    color: totalPnL >= 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {totalPnL >= 0 ? '+' : ''}{formatETH(totalPnL)} ETH
                  </div>
                  <div style={{ 
                    color: totalPnL >= 0 ? '#22c55e' : '#ef4444',
                    fontSize: '0.875rem',
                  }}>
                    {totalPnL >= 0 ? '+' : ''}{formatUSD(totalPnL)}
                  </div>
                </div>
                <div style={{
                  background: 'var(--black-surface)',
                  border: '1px solid var(--grey-800)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}>
                  <div style={{ color: 'var(--grey-500)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    HOLDINGS
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                    {holdings.length}
                  </div>
                  <div style={{ color: 'var(--grey-500)', fontSize: '0.875rem' }}>
                    agents
                  </div>
                </div>
              </div>

              {/* Holdings List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {holdings.map((holding) => holding && (
                  <div 
                    key={holding.handle}
                    style={{
                      background: 'var(--black-surface)',
                      border: '1px solid var(--grey-800)',
                      borderRadius: '12px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <img 
                        src={holding.agent.xProfileImage || '/logo.jpg'}
                        alt={holding.agent.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {holding.agent.name}
                          {holding.agent.isVerified && (
                            <span style={{ color: '#22c55e', marginLeft: '0.5rem' }}>✓</span>
                          )}
                        </div>
                        <div style={{ color: 'var(--grey-500)', fontSize: '0.875rem' }}>
                          @{holding.agent.xHandle}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>
                          {holding.amount} claws
                        </div>
                        <div style={{ 
                          color: holding.pnlPercent >= 0 ? '#22c55e' : '#ef4444',
                          fontSize: '0.875rem',
                        }}>
                          {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--grey-800)',
                    }}>
                      <div>
                        <span style={{ color: 'var(--grey-500)', fontSize: '0.75rem' }}>Value: </span>
                        <span style={{ fontWeight: 500 }}>{formatETH(holding.value)} ETH</span>
                        <span style={{ color: 'var(--grey-500)', marginLeft: '0.5rem' }}>
                          ({formatUSD(holding.value)})
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => openTrade(holding.handle, 'buy')}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#22c55e',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                          }}
                        >
                          BUY
                        </button>
                        <button 
                          onClick={() => openTrade(holding.handle, 'sell')}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                          }}
                        >
                          SELL
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explore More */}
              <div style={{ 
                textAlign: 'center', 
                marginTop: '2rem',
                padding: '2rem',
                background: 'var(--black-surface)',
                border: '1px solid var(--grey-800)',
                borderRadius: '12px',
              }}>
                <p style={{ color: 'var(--grey-500)', marginBottom: '1rem' }}>
                  Want to diversify your clawfolio?
                </p>
                <Link href="/" className="btn btn-red">
                  Explore More Agents
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Trade Modal */}
      {tradeModal.isOpen && selectedAgent && (
        <TradeModal
          isOpen={tradeModal.isOpen}
          onClose={() => setTradeModal({ ...tradeModal, isOpen: false })}
          agentName={selectedAgent.name}
          agentHandle={selectedAgent.xHandle}
          agentImage={selectedAgent.xProfileImage}
          initialMode={tradeModal.mode}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
