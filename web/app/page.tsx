'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  getAgentList, 
  getTopByPrice, 
  AGENTS, 
  formatETH, 
  formatUSD,
  calculateCurrentPrice 
} from '@/lib/agents';
import { TradeModal } from '@/components/trade-modal';

// Header component
function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <span className="logo-text">CLAWS</span>
        </Link>
        
        <nav className="header-nav">
          <a href="#agents" className="header-link">Agents</a>
          <a href="#leaderboard" className="header-link">Leaderboard</a>
          <Link href="/verify" className="header-link">Verify</Link>
        </nav>
        
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                {!connected ? (
                  <button onClick={openConnectModal} className="btn btn-red">
                    Connect
                  </button>
                ) : chain.unsupported ? (
                  <button onClick={openChainModal} className="btn btn-ghost">
                    Wrong Network
                  </button>
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
  );
}

// Agent Card
function AgentCard({ agent, onTrade }: { 
  agent: ReturnType<typeof getAgentList>[0];
  onTrade: (handle: string, mode: 'buy' | 'sell') => void;
}) {
  const { isConnected } = useAccount();
  const isUp = agent.priceChange24h >= 0;
  
  return (
    <div className={`agent-card ${agent.clawsVerified ? 'verified' : ''}`}>
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
              onClick={() => onTrade(agent.xHandle, 'buy')}
            >
              BUY
            </button>
            <button 
              className="agent-action sell"
              onClick={() => onTrade(agent.xHandle, 'sell')}
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
}

// Main Page - Single flow
export default function HomePage() {
  const agents = useMemo(() => getAgentList(), []);
  const topAgents = useMemo(() => getTopByPrice(5), []);
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
    mode: 'buy' | 'sell';
  }>({ isOpen: false, handle: '', mode: 'buy' });
  
  const totalVolume = useMemo(() => 
    Object.values(AGENTS).reduce((acc, a) => acc + a.lifetimeVolumeETH, 0), 
    []
  );
  const totalHolders = useMemo(() => 
    Object.values(AGENTS).reduce((acc, a) => acc + a.holders, 0), 
    []
  );
  
  const selectedAgent = AGENTS[tradeModal.handle];
  
  const openTrade = (handle: string, mode: 'buy' | 'sell') => {
    setTradeModal({ isOpen: true, handle, mode });
  };
  
  return (
    <>
      <Header />
      
      <main className="main">
        {/* HERO */}
        <section className="hero">
          <h1 className="hero-title">
            <span>CLAWS</span>
          </h1>
          <p className="hero-sub">
            Speculate on AI agents. The earlier you believe, the more you make.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#agents" className="btn btn-red">
              Start Trading
            </a>
            <Link href="/verify" className="btn btn-ghost">
              List Your Agent
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{formatETH(totalVolume)} ETH</div>
              <div className="hero-stat-label">Total Volume</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{agents.length}</div>
              <div className="hero-stat-label">Agents</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{totalHolders}</div>
              <div className="hero-stat-label">Traders</div>
            </div>
          </div>
        </section>
        
        {/* FORMULA */}
        <section className="formula-section">
          <div className="formula">price = supply² ÷ 16000 ETH</div>
          <p className="formula-desc">
            The friend.tech formula. Prices get expensive fast. 
            First claw costs $0.19. The 100th costs $1,875. Be early.
          </p>
        </section>
        
        {/* AGENTS */}
        <section id="agents" className="section agents-section section-full">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span>All</span> Agents
              </h2>
            </div>
            
            <div className="agents-grid">
              {agents.map((agent) => (
                <AgentCard 
                  key={agent.address} 
                  agent={agent} 
                  onTrade={openTrade}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* LEADERBOARD */}
        <section id="leaderboard" className="section">
          <div className="section-header">
            <h2 className="section-title">
              <span>Top</span> by Price
            </h2>
          </div>
          
          <div className="leaderboard">
            <div className="leaderboard-header">
              <div>#</div>
              <div>Agent</div>
              <div style={{ textAlign: 'right' }}>Price</div>
              <div style={{ textAlign: 'right' }}>Supply</div>
            </div>
            
            {topAgents.map((agent, i) => (
              <a 
                key={agent.address}
                href={`https://x.com/${agent.xHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="leaderboard-item"
              >
                <div className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i + 1}
                </div>
                <div className="leaderboard-agent">
                  <div className="leaderboard-avatar">
                    <Image 
                      src={agent.xProfileImage} 
                      alt={agent.name}
                      width={36}
                      height={36}
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="leaderboard-name">{agent.name}</div>
                    <div className="leaderboard-handle">@{agent.xHandle}</div>
                  </div>
                </div>
                <div className="leaderboard-price">{formatETH(agent.priceETH)} ETH</div>
                <div className="leaderboard-supply">{agent.supply}</div>
              </a>
            ))}
          </div>
        </section>
        
        {/* HOW IT WORKS */}
        <section className="section" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '3rem' }}>
            How It <span>Works</span>
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--red)' }}>1</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Buy Early</h3>
              <p style={{ color: 'var(--grey-500)' }}>
                Find agents you believe in. Buy their claws before everyone else.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--red)' }}>2</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Price Rises</h3>
              <p style={{ color: 'var(--grey-500)' }}>
                Each purchase increases the price. Early believers get rewarded.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--red)' }}>3</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Sell Anytime</h3>
              <p style={{ color: 'var(--grey-500)' }}>
                Exit whenever you want. 5% goes to the agent, 5% to protocol.
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="section" style={{ 
          textAlign: 'center',
          padding: '6rem 2rem',
          background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.1) 0%, transparent 70%)',
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Ready to speculate?
          </h2>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            Find undervalued agents. Build conviction. Stake your claim.
          </p>
          <a href="#agents" className="btn btn-red" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            View All Agents
          </a>
        </section>
        
        {/* FOOTER */}
        <footer style={{ 
          padding: '2rem',
          borderTop: '1px solid var(--grey-800)',
          textAlign: 'center',
          color: 'var(--grey-600)',
          fontSize: '0.875rem',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <a 
              href="https://x.com/clawcustos" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--grey-500)', marginRight: '1.5rem' }}
            >
              Twitter
            </a>
            <a 
              href="https://github.com/clawcustos/claws" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--grey-500)' }}
            >
              GitHub
            </a>
          </div>
          <div>Built on Base</div>
        </footer>
      </main>
      
      {/* Trade Modal */}
      {tradeModal.isOpen && selectedAgent && (
        <TradeModal
          isOpen={tradeModal.isOpen}
          onClose={() => setTradeModal({ ...tradeModal, isOpen: false })}
          agentName={selectedAgent.name}
          agentHandle={selectedAgent.xHandle}
          agentImage={selectedAgent.xProfileImage}
          currentPriceETH={calculateCurrentPrice(selectedAgent.supply)}
          supply={selectedAgent.supply}
          initialMode={tradeModal.mode}
        />
      )}
    </>
  );
}
