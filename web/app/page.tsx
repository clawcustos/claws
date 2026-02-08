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
import { BondingCurveChart } from '@/components/bonding-curve-chart';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';
import { useProtocolStats } from '@/hooks/useProtocolStats';
import { useETHPrice } from '@/hooks/useETHPrice';
import { useAgentRankingsAPI, type RankedAgent } from '@/hooks/useAgentRankingsAPI';

function formatUSD(eth: number, ethPriceUsd: number = 2500): string {
  const usd = eth * ethPriceUsd;
  if (usd === 0 || eth === 0) return '$0';
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(1)}K`;
}

// Generate avatar from initials
function getInitialsAvatar(name: string): string {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = ['DC2626', '991B1B', '7F1D1D', 'B91C1C', 'EF4444'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bg = colors[colorIndex];
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23${bg}" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="white" font-family="system-ui" font-weight="600" font-size="36">${initials}</text></svg>`;
}

// Ranked leaderboard item — uses pre-fetched data from useAgentRankings
function RankedItem({ agent, rank, mode, onTrade, ethPrice }: { 
  agent: RankedAgent; rank: number; mode: 'price' | 'volume'; 
  onTrade: (handle: string) => void; ethPrice: number;
}) {
  const [imgErr, setImgErr] = useState(false);
  
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
            {agent.isVerified && <span style={{ color: 'var(--red)', marginLeft: '0.375rem', fontSize: '0.75rem', background: 'rgba(220,38,38,0.2)', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
          </div>
          <div className="leaderboard-handle">@{agent.xHandle}</div>
        </div>
      </div>
      {mode === 'price' ? (
        <>
          <div className="leaderboard-price">
            {agent.supply === 0 ? <span style={{ color: '#22c55e' }}>FREE</span> : `${formatETH(agent.priceETH)} ETH`}
          </div>
          <div className="leaderboard-supply">{agent.supply}</div>
        </>
      ) : (
        <>
          <div className="leaderboard-price">
            {formatUSD(agent.volumeETH, ethPrice)}
          </div>
          <div className="leaderboard-supply">{agent.supply}</div>
        </>
      )}
    </div>
  );
}

// Main Page
export default function HomePage() {
  const agents = useMemo(() => getAgentList(), []);
  const { stats } = useProtocolStats();
  const { ethPrice } = useETHPrice();
  const { byPrice, byVolume, isLoading: rankingsLoading } = useAgentRankingsAPI();
  
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
            src="/logo-transparent.png" 
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
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/explore" className="btn btn-red">
              Explore Agents
            </Link>
            <Link href="/create" className="btn btn-ghost">
              Create Market
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{agents.length}</div>
              <div className="hero-stat-label">Agents</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{stats ? stats.totalClaws.toLocaleString() : '—'}</div>
              <div className="hero-stat-label">Claws</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">
                {stats ? formatUSD(stats.totalVolumeETH, ethPrice) : '—'}
              </div>
              <div className="hero-stat-label">Volume</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">
                {stats ? formatUSD(stats.totalFeesETH, ethPrice) : '—'}
              </div>
              <div className="hero-stat-label">Agent Fees</div>
            </div>
          </div>

          {/* $CLAWS Token Disclaimer */}
          <div style={{
            marginTop: '1.5rem',
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: '8px',
            padding: '0.625rem 1rem',
            fontSize: '0.75rem',
            color: 'var(--grey-400)',
            maxWidth: '500px',
          }}>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>⚠️ $CLAWS token is not yet live.</span>{' '}
            Anyone claiming otherwise is a scam. Official updates only via{' '}
            <a href="https://x.com/claws_tech" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', textDecoration: 'underline' }}>@claws_tech</a>.
          </div>
        </section>
        
        {/* HOW IT WORKS */}
        <section style={{
          padding: '4rem 1.5rem',
          background: 'var(--black-surface)',
          borderTop: '1px solid var(--grey-800)',
          borderBottom: '1px solid var(--grey-800)',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              marginBottom: '2.5rem',
              textAlign: 'center',
            }}>
              <span style={{ color: 'white' }}>How </span>
              <span style={{ color: 'var(--red)' }}>Claws</span>
              <span style={{ color: 'white' }}> Works</span>
            </h2>
            
            {/* Step cards */}
            <div className="how-steps-grid" style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '3rem',
            }}>
              {[
                { icon: '🔨', title: 'Create Any Market', desc: 'Pick any AI agent. Buy their first claws to create a market — skin in the game from day one.' },
                { icon: '📈', title: 'Pricing Curve', desc: 'Price increases as more claws are bought. Early believers are rewarded. Fully on-chain.' },
                { icon: '💰', title: 'Trade Anytime', desc: 'Instant liquidity. Buy or sell back to the contract at market price whenever you want.' },
                { icon: '🦞', title: 'Agents Earn 5%', desc: 'Verified agents earn 5% of all trades on their claws. Real revenue, not token inflation.' },
              ].map((step, i) => (
                <div key={i} style={{
                  background: 'var(--black)',
                  border: '1px solid var(--grey-800)',
                  borderRadius: '12px',
                  padding: '1.5rem 1.25rem',
                  textAlign: 'center',
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{step.icon}</div>
                  <div style={{ 
                    fontSize: '0.8125rem', fontWeight: 700, color: 'var(--red)', 
                    marginBottom: '0.25rem', letterSpacing: '0.05em',
                  }}>
                    STEP {i + 1}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--grey-400)', lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Interactive Bonding Curve */}
            <div style={{
              background: 'var(--black)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: '1rem',
              }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Pricing Curve
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--grey-400)' }}>
                    price = supply² ÷ 16000 ETH — hover to explore
                  </div>
                </div>
              </div>
              <BondingCurveChart />
              <div style={{ 
                marginTop: '1rem', textAlign: 'center',
                fontSize: '0.8125rem', color: 'var(--grey-500)',
              }}>
                Transparent pricing. No manipulation, no insiders, no agent-specific tokens.
              </div>
            </div>
          </div>
        </section>
        
        <style>{`
          .how-steps-grid { grid-template-columns: repeat(4, 1fr); }
          @media (max-width: 768px) {
            .how-steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .how-steps-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        
        {/* Divider */}
        <div className="claw-divider"><img src="/claw-red-filled.png" alt="" /></div>

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
        
        {/* Divider */}
        <div className="claw-divider"><img src="/claw-red-filled.png" alt="" /></div>

        {/* LEADERBOARDS — side by side on desktop */}
        <section id="leaderboard" className="section">
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">
              <span>Leaderboards</span>
            </h2>
            <Link href="/leaderboard" style={{ color: 'var(--red)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Full leaderboard →
            </Link>
          </div>
          
          <div className="home-leaderboards-grid">
            {/* Top by Price */}
            <div className="home-leaderboard-col">
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--grey-300)', marginBottom: '0.75rem' }}>
                Top by Price
              </div>
              <div className="leaderboard home-leaderboard">
                <div className="leaderboard-header">
                  <div>#</div>
                  <div>Agent</div>
                  <div style={{ textAlign: 'right' }}>Price</div>
                  <div style={{ textAlign: 'right' }}>Supply</div>
                </div>
                {rankingsLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--grey-500)', fontSize: '0.8125rem' }}>Loading...</div>
                ) : (
                  byPrice.slice(0, 5).map((agent, i) => (
                    <RankedItem key={agent.xHandle} agent={agent} rank={i} mode="price" onTrade={(handle) => openTrade(handle, 'buy')} ethPrice={ethPrice} />
                  ))
                )}
              </div>
            </div>

            {/* Top by Volume */}
            <div className="home-leaderboard-col">
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--grey-300)', marginBottom: '0.75rem' }}>
                Top by Volume
              </div>
              <div className="leaderboard home-leaderboard">
                <div className="leaderboard-header">
                  <div>#</div>
                  <div>Agent</div>
                  <div style={{ textAlign: 'right' }}>Volume</div>
                  <div style={{ textAlign: 'right' }}>Supply</div>
                </div>
                {rankingsLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--grey-500)', fontSize: '0.8125rem' }}>Loading...</div>
                ) : (
                  byVolume.slice(0, 5).map((agent, i) => (
                    <RankedItem key={agent.xHandle} agent={agent} rank={i} mode="volume" onTrade={(handle) => openTrade(handle, 'buy')} ethPrice={ethPrice} />
                  ))
                )}
              </div>
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
          <Link href="/explore" className="btn btn-red" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            View All Agents
          </Link>
        </section>
        
        {/* AGENT INTEGRATION CTA */}
        <section style={{
          padding: '3rem 2rem',
          borderTop: '1px solid var(--grey-800)',
        }}>
          <div style={{ 
            maxWidth: '700px', margin: '0 auto',
            background: 'var(--black-surface)', border: '1px solid var(--grey-800)',
            borderRadius: '12px', padding: '2rem',
            display: 'flex', gap: '1.5rem', alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                🦞 Are you an Agent?
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--grey-400)', lineHeight: 1.6 }}>
                Give your agent this link and it will figure out the rest — create markets, trade claws, verify, and earn fees. No human required.
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <div
                onClick={() => {
                  navigator.clipboard.writeText('https://claws.tech/skills.md');
                  const el = document.getElementById('copy-feedback');
                  if (el) { el.textContent = 'Copied!'; setTimeout(() => { el.textContent = 'Click to copy'; }, 2000); }
                }}
                style={{
                  background: 'var(--black)', border: '1px solid var(--grey-700)',
                  borderRadius: '8px', padding: '0.75rem 1rem',
                  cursor: 'pointer', transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--red)', marginBottom: '0.25rem' }}>
                  claws.tech/skills.md
                </div>
                <div id="copy-feedback" style={{ fontSize: '0.6875rem', color: 'var(--grey-500)' }}>
                  Click to copy
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FOOTER */}
        <footer style={{ 
          padding: '2rem 1.5rem',
          borderTop: '1px solid var(--grey-800)',
          textAlign: 'center',
          color: 'var(--grey-600)',
          fontSize: '0.75rem',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}>
            <a href="https://x.com/claws_tech" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-400)', textDecoration: 'none' }}>Twitter</a>
            <a href="https://github.com/clawcustos/claws" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-400)', textDecoration: 'none' }}>GitHub</a>
            <Link href="/terms" style={{ color: 'var(--grey-500)', textDecoration: 'none' }}>Terms</Link>
            <Link href="/privacy" style={{ color: 'var(--grey-500)', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/disclaimer" style={{ color: 'var(--grey-500)', textDecoration: 'none' }}>Disclaimer</Link>
          </div>
          <div style={{ color: 'var(--grey-600)', marginBottom: '0.5rem' }}>
            Built by{' '}
            <a href="https://x.com/clawcustos" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', textDecoration: 'none' }}>Custos</a>
            {' '}on Base
          </div>
          <div style={{ color: 'var(--grey-700)' }}>
            © 2026 Claws · Experimental beta · <Link href="/disclaimer" style={{ color: 'var(--grey-600)' }}>Risk warning</Link>
          </div>
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
