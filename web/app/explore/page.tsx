'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, AGENTS, formatETH, calculateCurrentPrice } from '@/lib/agents';
import { TradeModal } from '@/components/trade-modal';

type SortOption = 'price' | 'supply' | 'volume' | 'change';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const { isConnected } = useAccount();
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
    mode: 'buy' | 'sell';
  }>({ isOpen: false, handle: '', mode: 'buy' });
  
  const allAgents = useMemo(() => {
    return getAgentList().map(agent => ({
      ...agent,
      lifetimeVolumeETH: AGENTS[agent.xHandle.toLowerCase()]?.lifetimeVolumeETH || 0,
    }));
  }, []);
  
  const filteredAgents = useMemo(() => {
    return allAgents
      .filter((agent) => {
        if (search) {
          const q = search.toLowerCase();
          return agent.name.toLowerCase().includes(q) || agent.xHandle.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price': return b.priceETH - a.priceETH;
          case 'supply': return b.supply - a.supply;
          case 'volume': return b.lifetimeVolumeETH - a.lifetimeVolumeETH;
          case 'change': return b.priceChange24h - a.priceChange24h;
          default: return 0;
        }
      });
  }, [allAgents, search, sortBy]);

  const selectedAgent = AGENTS[tradeModal.handle];

  const openTrade = (handle: string, mode: 'buy' | 'sell') => {
    setTradeModal({ isOpen: true, handle, mode });
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">
            <span className="logo-text">CLAWS</span>
          </Link>
          
          <nav className="header-nav">
            <Link href="/" className="header-link">Home</Link>
            <Link href="/leaderboard" className="header-link">Leaderboard</Link>
          </nav>
          
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

      <main className="main" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="section">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            <span className="text-red">Explore</span> Agents
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            {allAgents.length} agents available for trading.
          </p>
          
          {/* Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                background: 'var(--black-surface)',
                border: '1px solid var(--grey-800)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--white)',
                fontSize: '0.875rem',
              }}
            />
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                background: 'var(--black-surface)',
                border: '1px solid var(--grey-800)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--white)',
                fontSize: '0.875rem',
              }}
            >
              <option value="price">Sort by Price</option>
              <option value="supply">Sort by Supply</option>
              <option value="volume">Sort by Volume</option>
              <option value="change">Sort by Change</option>
            </select>
          </div>
          
          {/* Grid */}
          <div className="agents-grid">
            {filteredAgents.map((agent) => {
              const isUp = agent.priceChange24h >= 0;
              
              return (
                <div key={agent.address} className={`agent-card ${agent.clawsVerified ? 'verified' : ''}`}>
                  <div className="agent-header">
                    <div className="agent-avatar">
                      <Image 
                        src={agent.xProfileImage} 
                        alt={agent.name}
                        width={48}
                        height={48}
                        unoptimized
                      />
                    </div>
                    <div className="agent-info">
                      <div className="agent-name">
                        {agent.name}
                        {agent.clawsVerified && <span className="verified-badge">✓</span>}
                      </div>
                      <a 
                        href={`https://x.com/${agent.xHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="agent-handle"
                      >
                        @{agent.xHandle}
                      </a>
                    </div>
                  </div>
                  
                  <div className="agent-price">
                    <div className="agent-price-eth">{formatETH(agent.priceETH)} ETH</div>
                    <div className="agent-price-usd">{agent.priceUSD}</div>
                    <div className={`agent-price-change ${isUp ? 'up' : 'down'}`}>
                      {isUp ? '↑' : '↓'} {Math.abs(agent.priceChange24h).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="agent-stats">
                    <div className="agent-stat">
                      <div className="agent-stat-value">{agent.supply}</div>
                      <div className="agent-stat-label">Supply</div>
                    </div>
                    <div className="agent-stat">
                      <div className="agent-stat-value">{agent.volume24h}</div>
                      <div className="agent-stat-label">Volume</div>
                    </div>
                  </div>
                  
                  <div className="agent-actions">
                    {isConnected ? (
                      <>
                        <button 
                          className="agent-action buy"
                          onClick={() => openTrade(agent.xHandle, 'buy')}
                        >
                          BUY
                        </button>
                        <button 
                          className="agent-action sell"
                          onClick={() => openTrade(agent.xHandle, 'sell')}
                        >
                          SELL
                        </button>
                      </>
                    ) : (
                      <ConnectButton.Custom>
                        {({ openConnectModal }) => (
                          <button 
                            className="agent-action buy"
                            onClick={openConnectModal}
                            style={{ gridColumn: '1 / -1' }}
                          >
                            CONNECT TO TRADE
                          </button>
                        )}
                      </ConnectButton.Custom>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      
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
    </>
  );
}
