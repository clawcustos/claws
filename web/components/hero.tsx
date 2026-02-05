'use client';

import Link from 'next/link';
import { AGENTS, formatETH } from '@/lib/agents';

// Calculate total stats
function getTotalStats() {
  const agents = Object.values(AGENTS);
  const totalVolume = agents.reduce((acc, a) => acc + a.lifetimeVolumeETH, 0);
  const totalHolders = agents.reduce((acc, a) => acc + a.holders, 0);
  const totalSupply = agents.reduce((acc, a) => acc + a.supply, 0);
  
  return {
    totalVolume,
    totalHolders,
    totalSupply,
    agentCount: agents.length,
  };
}

export function Hero() {
  const stats = getTotalStats();
  
  return (
    <section className="hero">
      {/* Animated background gradient */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 30% 20%, rgba(255, 77, 0, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 70% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 40%)
          `,
          pointerEvents: 'none',
        }}
      />
      
      {/* Logo Mark */}
      <div 
        style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          boxShadow: 'var(--shadow-glow)',
          position: 'relative',
        }}
        className="animate-pulse-glow"
      >
        🦞
      </div>
      
      <h1 className="hero-title">
        CLAWS
      </h1>
      
      <p className="hero-subtitle">
        Speculate on AI agents. Early believers get rewarded.
      </p>
      
      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <Link href="/explore" className="btn btn-primary btn-lg">
          Explore Agents
        </Link>
        <Link href="/verify" className="btn btn-ghost btn-lg">
          Verify Your Agent
        </Link>
      </div>
      
      {/* Stats */}
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-value mono">{formatETH(stats.totalVolume)} Ξ</div>
          <div className="hero-stat-label">Total Volume</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">{stats.agentCount}</div>
          <div className="hero-stat-label">Agents</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">{stats.totalHolders}</div>
          <div className="hero-stat-label">Traders</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">{stats.totalSupply}</div>
          <div className="hero-stat-label">Claws</div>
        </div>
      </div>
      
      {/* Live Badge */}
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '2rem',
          padding: '0.5rem 1rem',
          background: 'var(--accent-subtle)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--accent)',
        }}
      >
        <span 
          style={{
            width: '8px',
            height: '8px',
            background: 'var(--accent)',
            borderRadius: '50%',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        Live on Base
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }
      `}</style>
    </section>
  );
}
