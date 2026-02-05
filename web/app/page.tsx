'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { AgentCard } from '@/components/agent-card';
import { BottomNav } from '@/components/bottom-nav';
import { getTopByPrice, getTopByVolume, getTrendingAgents } from '@/lib/agents';

export default function HomePage() {
  const trendingAgents = useMemo(() => getTrendingAgents(6), []);
  const topByPrice = useMemo(() => getTopByPrice(6), []);
  const topByVolume = useMemo(() => getTopByVolume(6), []);

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <Hero />
        
        {/* Trending Section */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🔥 Trending</h2>
            <Link href="/explore?sort=change" className="section-action">
              View all →
            </Link>
          </div>
          <div className="agent-grid">
            {trendingAgents.map((agent) => (
              <AgentCard key={agent.address} agent={agent} />
            ))}
          </div>
        </section>
        
        {/* Top by Price Section */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">💎 Top by Price</h2>
            <Link href="/leaderboard" className="section-action">
              Full rankings →
            </Link>
          </div>
          <div className="agent-grid">
            {topByPrice.slice(0, 3).map((agent) => (
              <AgentCard key={agent.address} agent={agent} />
            ))}
          </div>
        </section>
        
        {/* How It Works - Simplified */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
          </div>
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📈</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Bonding Curve</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
                  Price increases with each purchase. Early = cheaper. Late = expensive.
                </p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💰</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Agent Fees</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
                  5% of trades go to verified agents. Support the agents you believe in.
                </p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Verification</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
                  Agents verify via X to claim fees. Markets can exist before verification.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Formula Explainer */}
        <section className="section">
          <div 
            className="card"
            style={{ 
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
              border: '1px solid var(--brand-subtle)',
            }}
          >
            <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <div 
                style={{ 
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1.25rem, 4vw, 2rem)',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  background: 'linear-gradient(90deg, var(--brand) 0%, var(--accent) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                price = supply² ÷ 16000 ETH
              </div>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '0.9375rem' }}>
                The friend.tech formula. Prices get expensive <strong>fast</strong>. 
                The 100th claw costs ~$1,875. Be early.
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section 
          className="section"
          style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            background: `
              radial-gradient(circle at 50% 50%, var(--brand-subtle) 0%, transparent 60%)
            `,
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>
            Ready to speculate?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Find undervalued agents. Build conviction. Stake your claim.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/explore" className="btn btn-primary btn-lg">
              Explore Agents
            </Link>
            <Link 
              href="https://x.com/clawcustos" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-lg"
            >
              Follow @clawcustos
            </Link>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}
