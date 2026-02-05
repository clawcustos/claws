'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';

// Mock portfolio data - will come from contract
const MOCK_HOLDINGS = [
  { handle: 'bankrbot', name: 'Bankr', amount: 3, avgCost: '45.20', currentPrice: '52.10', emoji: '💰' },
  { handle: 'moltbook', name: 'Moltbook', amount: 5, avgCost: '38.50', currentPrice: '41.20', emoji: '🦀' },
  { handle: 'clawcustos', name: 'Custos', amount: 10, avgCost: '6.80', currentPrice: '8.20', emoji: '🏛️' },
];

export default function ClawfolioPage() {
  const { address, isConnected } = useAccount();
  
  // Calculate totals
  const totalValue = MOCK_HOLDINGS.reduce((acc, h) => acc + (parseFloat(h.currentPrice) * h.amount), 0);
  const totalCost = MOCK_HOLDINGS.reduce((acc, h) => acc + (parseFloat(h.avgCost) * h.amount), 0);
  const totalPnL = totalValue - totalCost;
  const pnlPercent = (totalPnL / totalCost) * 100;

  if (!isConnected) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="empty-state" style={{ marginTop: '4rem' }}>
            <div className="empty-state-icon">💼</div>
            <h2 className="empty-state-title">Connect Your Wallet</h2>
            <p className="empty-state-desc">Connect your wallet to view your clawfolio</p>
            <div style={{ marginTop: '1.5rem' }}>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button 
                    onClick={openConnectModal}
                    className="btn btn-primary btn-lg"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
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
      
      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Clawfolio
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your agent claw holdings and performance
          </p>
        </div>
        
        {/* Portfolio Summary */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                ${totalValue.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Total Value
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div 
                className="mono" 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  color: totalPnL >= 0 ? 'var(--positive)' : 'var(--negative)',
                }}
              >
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Unrealized P&L
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div 
                className="mono" 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  color: pnlPercent >= 0 ? 'var(--positive)' : 'var(--negative)',
                }}
              >
                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Return
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {MOCK_HOLDINGS.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Agents
              </div>
            </div>
          </div>
        </div>
        
        {/* Holdings Table */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Holdings</h2>
          </div>
          
          <div className="card">
            {MOCK_HOLDINGS.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table 
                  style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem',
                  }}
                >
                  <thead>
                    <tr 
                      style={{ 
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                      }}
                    >
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Agent
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Claws
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Avg Cost
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Price
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Value
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_HOLDINGS.map((holding) => {
                      const value = parseFloat(holding.currentPrice) * holding.amount;
                      const cost = parseFloat(holding.avgCost) * holding.amount;
                      const pnl = value - cost;
                      const pnlPct = (pnl / cost) * 100;
                      
                      return (
                        <tr 
                          key={holding.handle}
                          style={{ borderBottom: '1px solid var(--border)' }}
                        >
                          <td style={{ padding: '1rem' }}>
                            <Link 
                              href={`/agent/${holding.handle}`}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem',
                                textDecoration: 'none',
                                color: 'inherit',
                              }}
                            >
                              <div 
                                style={{ 
                                  width: '36px', 
                                  height: '36px', 
                                  background: 'var(--bg-elevated)',
                                  borderRadius: 'var(--radius-sm)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.25rem',
                                }}
                              >
                                {holding.emoji}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{holding.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                  @{holding.handle}
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="mono" style={{ padding: '1rem', textAlign: 'right' }}>
                            {holding.amount}
                          </td>
                          <td className="mono" style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                            ${holding.avgCost}
                          </td>
                          <td className="mono" style={{ padding: '1rem', textAlign: 'right' }}>
                            ${holding.currentPrice}
                          </td>
                          <td className="mono" style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                            ${value.toFixed(2)}
                          </td>
                          <td 
                            className="mono" 
                            style={{ 
                              padding: '1rem', 
                              textAlign: 'right',
                              color: pnl >= 0 ? 'var(--positive)' : 'var(--negative)',
                            }}
                          >
                            {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">💼</div>
                <h3 className="empty-state-title">No holdings yet</h3>
                <p className="empty-state-desc">Buy some claws to get started</p>
                <Link href="/explore" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Explore Agents
                </Link>
              </div>
            )}
          </div>
        </section>
        
        {/* Transaction History Placeholder */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Transaction History</h2>
          </div>
          
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <h3 className="empty-state-title">No transactions yet</h3>
              <p className="empty-state-desc">Your trade history will appear here</p>
            </div>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}
