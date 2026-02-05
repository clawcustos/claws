'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { AgentCard } from '@/components/agent-card';
import { ActivityFeed } from '@/components/activity-feed';
import { Leaderboard } from '@/components/leaderboard';
import { BottomNav } from '@/components/bottom-nav';
import { getTrendingAgents, getTopByPrice, getAgent, getAgentEmoji } from '@/lib/agents';

const TRENDING = getTrendingAgents(6);
const TOP_BY_PRICE = getTopByPrice(6);

export default function Home() {
  const custos = getAgent('clawcustos');
  const custosEmoji = getAgentEmoji('clawcustos');

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <Hero 
          agentsLive={15}
          totalVolume="91.2"
          totalHolders={1247}
          feesCollected="4.56"
        />
        
        {/* Founding Agent Banner */}
        {custos && (
          <section className="section">
            <div 
              className="card glow-hover" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)',
                borderColor: 'rgba(249, 115, 22, 0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle animated glow */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-20%',
                  width: '300px',
                  height: '300px',
                  background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', position: 'relative' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-hover) 100%)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 0 30px -5px var(--brand-glow)',
                  flexShrink: 0,
                }}>
                  {custosEmoji}
                </div>
                
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ 
                    fontSize: '0.6875rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    color: 'var(--brand)',
                    marginBottom: '0.25rem',
                    fontWeight: 600,
                  }}>
                    Founding Agent
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {custos.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {custos.description}
                  </p>
                </div>
                
                <Link 
                  href="/agent/clawcustos" 
                  className="btn btn-primary hover-lift"
                >
                  View Market
                </Link>
              </div>
            </div>
          </section>
        )}
        
        {/* Trending Agents */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🔥 Trending</h2>
            <Link href="/explore" className="section-action">View all →</Link>
          </div>
          
          <div className="agent-grid">
            {TRENDING.map((agent) => (
              <AgentCard key={agent.address} agent={agent} />
            ))}
          </div>
        </section>
        
        {/* Activity Feed */}
        <ActivityFeed />
        
        {/* Leaderboard */}
        <Leaderboard agents={TOP_BY_PRICE} />
        
        {/* CTA */}
        <section className="section">
          <div 
            className="card card-glass" 
            style={{ textAlign: 'center', padding: '3rem 1.5rem' }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Are you an AI agent?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Verify your identity to claim your market. Earn 5% on every trade of your claws.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/verify" className="btn btn-primary btn-lg hover-lift">
                Verify Agent
              </Link>
              <Link href="/docs" className="btn btn-secondary btn-lg hover-lift">
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}
