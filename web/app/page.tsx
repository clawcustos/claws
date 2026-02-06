'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  getAgentList, 
  AGENTS, 
  formatETH, 
  type AgentListItem
} from '@/lib/agents';
import { TradeModal } from '@/components/trade-modal';
import { AgentCard } from '@/components/agent-card';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';

// Generate avatar from initials
function getInitialsAvatar(name: string): string {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = ['DC2626', '991B1B', '7F1D1D', 'B91C1C', 'EF4444'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bg = colors[colorIndex];
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23${bg}" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="white" font-family="system-ui" font-weight="600" font-size="36">${initials}</text></svg>`;
}

// Leaderboard Item — fetches real data from contract
function LeaderboardItem({ agent, rank, onTrade }: { agent: AgentListItem; rank: number; onTrade: (handle: string) => void }) {
  const [imgErr, setImgErr] = useState(false);
  const { market, isLoading } = useMarket(agent.xHandle);
  const { priceETH } = useCurrentPrice(agent.xHandle);
  
  const supply = market?.supply !== undefined ? Number(market.supply) : 0;
  const isVerified = market?.isVerified || false;
  const price = priceETH || 0;
  
  return (
    <div 
      onClick={() => onTrade(agent.xHandle)}
      className="leaderboard-item"
      style={{ cursor: 'pointer' }}
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
          <div className="leaderboard-name">
            {agent.name}
            {isVerified && <span style={{ color: '#22c55e', marginLeft: '0.375rem' }}>✓</span>}
          </div>
          <div className="leaderboard-handle">@{agent.xHandle}</div>
        </div>
      </div>
      <div className="leaderboard-price">
        {isLoading ? '...' : supply === 0 ? <span style={{ color: '#22c55e' }}>FREE</span> : `${formatETH(price)} ETH`}
      </div>
      <div className="leaderboard-supply">{isLoading ? '...' : supply}</div>
    </div>
  );
}

// Main Page
export default function HomePage() {
  const agents = useMemo(() => getAgentList(), []);
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
    mode: 'buy' | 'sell';
  }>({ isOpen: false, handle: '', mode: 'buy' });
  
  const selectedAgent = AGENTS[tradeModal.handle];
  
  const openTrade = (handle: string, mode: 'buy' | 'sell') => {
    setTradeModal({ isOpen: true, handle, mode });
  };
  
  return (
    <>
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
            <Link href="/explore" className="btn btn-red">
              Explore Agents
            </Link>
            <Link href="/verify" className="btn btn-ghost">
              Verify Agent
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{agents.length}</div>
              <div className="hero-stat-label">Agents</div>
            </div>
          </div>
        </section>
        
        {/* HOW IT WORKS */}
        <section style={{
          padding: '3rem 1.5rem',
          background: 'var(--black-surface)',
          borderTop: '1px solid var(--grey-800)',
          borderBottom: '1px solid var(--grey-800)',
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '2rem',
              textAlign: 'center',
            }}>
              <span style={{ color: 'white' }}>How </span>
              <span style={{ color: 'var(--red)' }}>Claws</span>
              <span style={{ color: 'white' }}> Works</span>
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--red)', marginBottom: '0.5rem' }}>1</div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Start Any Market Free</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--grey-400)' }}>
                  The first claw on every agent costs nothing. Be first and pay zero.
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--red)', marginBottom: '0.5rem' }}>2</div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Bonding Curve Pricing</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--grey-400)' }}>
                  Price increases as more claws are bought. Early believers are rewarded.
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--red)', marginBottom: '0.5rem' }}>3</div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Sell Anytime</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--grey-400)' }}>
                  Instant liquidity. Sell back to the contract at market price whenever you want.
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--red)', marginBottom: '0.5rem' }}>4</div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Agents Earn 5%</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--grey-400)' }}>
                  Verified agents earn 5% of all trades on their claws, plus 1 free claw on verification.
                </div>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: 'var(--black)', 
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'monospace', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                price = supply² ÷ 16000 ETH
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--grey-400)' }}>
                Transparent pricing. No manipulation, no insiders, no agent-specific tokens.
              </div>
            </div>
          </div>
        </section>
        
        {/* FEATURED AGENTS — live data via AgentCard */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">
              Featured <span>Agents</span>
            </h2>
            <Link href="/explore" style={{ color: 'var(--red)', textDecoration: 'none', fontSize: '0.875rem' }}>
              View all →
            </Link>
          </div>
          
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <div className="agents-grid">
                {agents.slice(0, 6).map((agent) => (
                  <AgentCard 
                    key={agent.address} 
                    agent={agent} 
                    onTrade={openTrade}
                    onConnect={openConnectModal}
                  />
                ))}
              </div>
            )}
          </ConnectButton.Custom>
        </section>
        
        {/* LEADERBOARD — live data */}
        <section id="leaderboard" className="section">
          <div className="section-header">
            <h2 className="section-title">
              <span>Top</span> by Price
            </h2>
            <Link href="/leaderboard" style={{ color: 'var(--red)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Full leaderboard →
            </Link>
          </div>
          
          <div className="leaderboard">
            <div className="leaderboard-header">
              <div>#</div>
              <div>Agent</div>
              <div style={{ textAlign: 'right' }}>Price</div>
              <div style={{ textAlign: 'right' }}>Supply</div>
            </div>
            
            {agents.slice(0, 5).map((agent, i) => (
              <LeaderboardItem key={agent.xHandle} agent={agent} rank={i} onTrade={(handle) => openTrade(handle, 'buy')} />
            ))}
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
          <Link href="/explore" className="btn btn-red" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            View All Agents
          </Link>
        </section>
        
        {/* FOOTER */}
        <footer style={{ 
          padding: '3rem 2rem',
          borderTop: '1px solid var(--grey-800)',
          textAlign: 'center',
          color: 'var(--grey-600)',
          fontSize: '0.875rem',
        }}>
          <div style={{ marginBottom: '1.5rem', color: 'var(--grey-500)' }}>
            Created, built & designed by{' '}
            <a href="https://x.com/clawcustos" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', textDecoration: 'none' }}>
              Custos
            </a>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <a href="https://x.com/claws_tech" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-400)', marginRight: '1.5rem' }}>Twitter</a>
            <a href="https://github.com/clawcustos/claws" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-400)' }}>GitHub</a>
          </div>
          <div style={{ marginBottom: '1.5rem', color: 'var(--grey-500)' }}>Built on Base</div>
          <div style={{ marginBottom: '1.5rem' }}>
            <Link href="/terms" style={{ color: 'var(--grey-500)', marginRight: '1.5rem', fontSize: '0.8125rem' }}>Terms</Link>
            <Link href="/privacy" style={{ color: 'var(--grey-500)', marginRight: '1.5rem', fontSize: '0.8125rem' }}>Privacy</Link>
            <Link href="/disclaimer" style={{ color: 'var(--grey-500)', fontSize: '0.8125rem' }}>Disclaimer</Link>
          </div>
          <div style={{ 
            maxWidth: '600px', margin: '0 auto', padding: '1rem',
            background: 'var(--black-surface)', borderRadius: '8px',
            fontSize: '0.75rem', color: 'var(--grey-600)', lineHeight: 1.5,
          }}>
            <strong style={{ color: 'var(--grey-500)' }}>⚠️ Risk Warning:</strong> Claws is experimental beta software. 
            Trading involves substantial risk of loss. Prices are volatile. DYOR. Not financial advice.{' '}
            <Link href="/disclaimer" style={{ color: 'var(--red)' }}>Read full disclaimer →</Link>
          </div>
          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem' }}>© 2026 Claws. All rights reserved.</div>
        </footer>
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
