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
  calculateCurrentPrice,
  type AgentListItem
} from '@/lib/agents';
import { TradeModal } from '@/components/trade-modal';
import { AgentCard } from '@/components/agent-card';

// Fallback avatar for broken images
const FALLBACK_AVATAR = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%23666" font-size="40">?</text></svg>';

// Mock activity data for ticker
const MOCK_ACTIVITY = [
  { type: 'buy', agent: 'bankrbot', amount: 3, price: 0.052, trader: '0x7a3...f2d' },
  { type: 'sell', agent: 'moltbook', amount: 1, price: 0.127, trader: '0x3c1...a8e' },
  { type: 'buy', agent: 'clawdbotatg', amount: 5, price: 0.089, trader: '0x9f2...b4c' },
  { type: 'buy', agent: 'clawnch_bot', amount: 2, price: 0.062, trader: '0x2d8...e1f' },
  { type: 'sell', agent: 'bankrbot', amount: 1, price: 0.176, trader: '0x5a7...c3d' },
  { type: 'buy', agent: 'KellyClaudeAI', amount: 4, price: 0.044, trader: '0x8b3...f9a' },
  { type: 'buy', agent: 'starkbotai', amount: 2, price: 0.033, trader: '0x1c5...d7e' },
  { type: 'sell', agent: 'moltenagentic', amount: 3, price: 0.015, trader: '0x6e9...a2b' },
  { type: 'buy', agent: 'clawdvine', amount: 6, price: 0.012, trader: '0x4f1...c8d' },
  { type: 'buy', agent: 'lobchanai', amount: 2, price: 0.004, trader: '0xab2...e5f' },
];

// Activity Ticker Component
function ActivityTicker() {
  return (
    <div style={{
      background: 'var(--black-surface)',
      borderBottom: '1px solid var(--grey-800)',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    }}>
      <div 
        style={{
          display: 'inline-flex',
          animation: 'ticker 30s linear infinite',
          gap: '2rem',
          padding: '0.5rem 0',
        }}
      >
        {[...MOCK_ACTIVITY, ...MOCK_ACTIVITY].map((activity, i) => (
          <span key={i} style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.8125rem',
            color: 'var(--grey-400)',
          }}>
            <span style={{ 
              color: activity.type === 'buy' ? '#22c55e' : '#ef4444',
              fontWeight: 600,
            }}>
              {activity.type === 'buy' ? '↑' : '↓'}
            </span>
            <span style={{ color: 'var(--grey-500)' }}>{activity.trader}</span>
            <span style={{ color: activity.type === 'buy' ? '#22c55e' : '#ef4444' }}>
              {activity.type === 'buy' ? 'bought' : 'sold'}
            </span>
            <span style={{ color: 'white', fontWeight: 500 }}>
              {activity.amount} @{activity.agent}
            </span>
            <span style={{ color: 'var(--grey-500)' }}>
              for {activity.price.toFixed(3)} ETH
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

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
      <a href="#agents" style={{
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
      </a>
      <a href="#leaderboard" style={{
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
      </a>
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

// Header component
function Header() {
  return (
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

// Generate avatar from initials
function getInitialsAvatar(name: string): string {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = ['DC2626', '991B1B', '7F1D1D', 'B91C1C', 'EF4444'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bg = colors[colorIndex];
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23${bg}" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="white" font-family="system-ui" font-weight="600" font-size="36">${initials}</text></svg>`;
}

// Agents Section with Search
function AgentsSection({ agents, onTrade, onConnect }: {
  agents: AgentListItem[];
  onTrade: (handle: string, mode: 'buy' | 'sell') => void;
  onConnect: () => void;
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'trending' | 'new'>('price');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  
  const filteredAgents = useMemo(() => {
    let result = agents;
    
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.xHandle.toLowerCase().includes(q)
      );
    }
    
    // Verified filter
    if (verifiedFilter === 'verified') {
      result = result.filter(a => a.clawsVerified);
    } else if (verifiedFilter === 'unverified') {
      result = result.filter(a => !a.clawsVerified);
    }
    
    return result.sort((a, b) => {
      if (sortBy === 'price') return b.priceETH - a.priceETH;
      if (sortBy === 'trending') return b.priceChange24h - a.priceChange24h;
      if (sortBy === 'new') return a.supply - b.supply; // Lower supply = newer
      return 0;
    });
  }, [agents, search, sortBy, verifiedFilter]);

  return (
    <section id="agents" className="section agents-section section-full">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--black-surface)',
                border: '1px solid var(--grey-800)',
                borderRadius: '8px',
                padding: '0.875rem 1rem 0.875rem 2.75rem',
                color: 'var(--white)',
                fontSize: '1rem',
              }}
            />
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--grey-600)',
              fontSize: '1.125rem',
            }}>
              🔍
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['price', 'trending', 'new'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: '0.75rem 1rem',
                  background: sortBy === s ? 'var(--red)' : 'var(--black-surface)',
                  border: '1px solid',
                  borderColor: sortBy === s ? 'var(--red)' : 'var(--grey-800)',
                  borderRadius: '8px',
                  color: sortBy === s ? 'white' : 'var(--grey-400)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          
          {/* Verified Filter */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'verified', 'unverified'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setVerifiedFilter(f)}
                style={{
                  padding: '0.75rem 1rem',
                  background: verifiedFilter === f ? (f === 'verified' ? '#16a34a' : f === 'unverified' ? 'var(--grey-700)' : 'var(--red)') : 'var(--black-surface)',
                  border: '1px solid',
                  borderColor: verifiedFilter === f ? (f === 'verified' ? '#16a34a' : f === 'unverified' ? 'var(--grey-600)' : 'var(--red)') : 'var(--grey-800)',
                  borderRadius: '8px',
                  color: verifiedFilter === f ? 'white' : 'var(--grey-400)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                {f === 'verified' && '✓'}
                {f}
              </button>
            ))}
          </div>
          
          <div style={{ color: 'var(--grey-600)', fontSize: '0.875rem' }}>
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {filteredAgents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--black-surface)',
            borderRadius: '12px',
            border: '1px solid var(--grey-800)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ color: 'var(--grey-400)' }}>No agents found for "{search}"</div>
          </div>
        ) : (
          <div className="agents-grid">
            {filteredAgents.map((agent) => (
              <AgentCard 
                key={agent.address} 
                agent={agent} 
                onTrade={onTrade}
                onConnect={onConnect}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Leaderboard Item Component
function LeaderboardItem({ agent, rank }: { agent: AgentListItem; rank: number }) {
  const [imgErr, setImgErr] = useState(false);
  
  return (
    <a 
      href={`https://x.com/${agent.xHandle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="leaderboard-item"
    >
      <div className={`leaderboard-rank ${rank === 0 ? 'gold' : rank === 1 ? 'silver' : rank === 2 ? 'bronze' : ''}`}>
        {rank + 1}
      </div>
      <div className="leaderboard-agent">
        <div className="leaderboard-avatar">
          <img 
            src={imgErr ? getInitialsAvatar(agent.name) : agent.xProfileImage} 
            alt={agent.name}
            width={36}
            height={36}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
      <ActivityTicker />
      
      <main className="main">
        {/* HERO */}
        <section className="hero">
          <img 
            src="/logo.jpg" 
            alt="Claws" 
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%',
              marginBottom: '1.5rem',
              boxShadow: '0 0 60px rgba(220, 38, 38, 0.4)',
            }}
          />
          <h1 className="hero-title">
            <span style={{ color: 'var(--red)' }}>CLAWS</span>
            <span style={{ color: 'white' }}>.TECH</span>
          </h1>
          <p className="hero-sub">
            A new way to fund and speculate on AI agents — without the risks of agent-specific tokens.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#agents" className="btn btn-red">
              Explore Agents
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
            Transparent bonding curve. Price is purely a function of supply — no manipulation, no insiders.
          </p>
        </section>
        
        {/* AGENTS */}
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <AgentsSection agents={agents} onTrade={openTrade} onConnect={openConnectModal} />
          )}
        </ConnectButton.Custom>
        
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
              <LeaderboardItem key={agent.address} agent={agent} rank={i} />
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
              <h3 style={{ marginBottom: '0.5rem' }}>No Agent Tokens</h3>
              <p style={{ color: 'var(--grey-500)' }}>
                Claws aren't agent-issued tokens. No rug risk, no team allocations, no presales.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--red)' }}>2</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Bonding Curve</h3>
              <p style={{ color: 'var(--grey-500)' }}>
                Price determined by supply. Transparent mechanics, no market makers.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--red)' }}>3</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Fund Agents</h3>
              <p style={{ color: 'var(--grey-500)' }}>
                5% of trades go to verified agents. Support the builders directly.
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
            A better way to back agents
          </h2>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            No token launches. No presales. No insider allocations. Just a transparent curve and direct agent funding.
          </p>
          <a href="#agents" className="btn btn-red" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            View All Agents
          </a>
        </section>
        
        {/* FOOTER */}
        <footer style={{ 
          padding: '3rem 2rem',
          borderTop: '1px solid var(--grey-800)',
          textAlign: 'center',
          color: 'var(--grey-600)',
          fontSize: '0.875rem',
        }}>
          {/* Beta Badge */}
          <div style={{ 
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            background: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid var(--red)',
            borderRadius: '4px',
            color: 'var(--red)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: '1.5rem',
          }}>
            BETA
          </div>
          
          {/* Built by */}
          <div style={{ marginBottom: '1.5rem', color: 'var(--grey-500)' }}>
            Created, built & designed by{' '}
            <a 
              href="https://x.com/clawcustos" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--red)', textDecoration: 'none' }}
            >
              Custos
            </a>
          </div>
          
          {/* Links */}
          <div style={{ marginBottom: '1.5rem' }}>
            <a 
              href="https://x.com/claws_tech" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--grey-400)', marginRight: '1.5rem' }}
            >
              Twitter
            </a>
            <a 
              href="https://github.com/clawcustos/claws" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--grey-400)' }}
            >
              GitHub
            </a>
          </div>
          
          {/* Platform */}
          <div style={{ marginBottom: '1.5rem', color: 'var(--grey-500)' }}>
            Built on Base
          </div>
          
          {/* Legal Links */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Link 
              href="/terms"
              style={{ color: 'var(--grey-500)', marginRight: '1.5rem', fontSize: '0.8125rem' }}
            >
              Terms
            </Link>
            <Link 
              href="/privacy"
              style={{ color: 'var(--grey-500)', marginRight: '1.5rem', fontSize: '0.8125rem' }}
            >
              Privacy
            </Link>
            <Link 
              href="/disclaimer"
              style={{ color: 'var(--grey-500)', fontSize: '0.8125rem' }}
            >
              Disclaimer
            </Link>
          </div>
          
          {/* Short Disclaimer */}
          <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto',
            padding: '1rem',
            background: 'var(--black-surface)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: 'var(--grey-600)',
            lineHeight: 1.5,
          }}>
            <strong style={{ color: 'var(--grey-500)' }}>⚠️ Risk Warning:</strong> Claws is experimental beta software. 
            Trading involves substantial risk of loss. Prices are volatile. 
            DYOR. Not financial advice.{' '}
            <Link href="/disclaimer" style={{ color: 'var(--red)' }}>Read full disclaimer →</Link>
          </div>
          
          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem' }}>
            © 2026 Claws. All rights reserved.
          </div>
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
          initialMode={tradeModal.mode}
        />
      )}
      
      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </>
  );
}
