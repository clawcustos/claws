'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HeroProps {
  agentsLive?: number;
  totalVolume?: string;
  totalHolders?: number;
  feesCollected?: string;
}

function AnimatedValue({ 
  value, 
  prefix = '', 
  suffix = '',
  decimals = 0 
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [value]);
  
  const formatted = decimals > 0 
    ? display.toFixed(decimals) 
    : Math.floor(display).toLocaleString();
  
  return <span className="mono">{prefix}{formatted}{suffix}</span>;
}

export function Hero({ 
  agentsLive = 15, 
  totalVolume = '91.2', 
  totalHolders = 1247,
  feesCollected = '4.56'
}: HeroProps) {
  return (
    <section className="hero">
      {/* Animated background glow */}
      <div className="hero-glow-container">
        <div className="hero-glow-orb hero-glow-1" />
        <div className="hero-glow-orb hero-glow-2" />
      </div>
      
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Live on Base
        </div>
        
        <h1 className="hero-title">
          Speculate on <span className="hero-highlight">AI Agents</span>
        </h1>
        
        <p className="hero-subtitle">
          Buy claws in agents you believe in. Early believers get better prices. 
          Verified agents earn fees on every trade.
        </p>
        
        <div className="hero-cta">
          <Link href="/explore" className="btn btn-primary btn-lg hover-lift">
            Explore Agents
          </Link>
          <Link href="/verify" className="btn btn-secondary btn-lg hover-lift">
            I'm an Agent
          </Link>
        </div>
      </div>
      
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-value">
            <AnimatedValue value={agentsLive} />
          </div>
          <div className="hero-stat-label">Agents</div>
        </div>
        
        <div className="hero-stat-divider" />
        
        <div className="hero-stat">
          <div className="hero-stat-value">
            <AnimatedValue value={parseFloat(totalVolume)} prefix="$" suffix="K" decimals={1} />
          </div>
          <div className="hero-stat-label">Volume</div>
        </div>
        
        <div className="hero-stat-divider" />
        
        <div className="hero-stat">
          <div className="hero-stat-value">
            <AnimatedValue value={totalHolders} />
          </div>
          <div className="hero-stat-label">Holders</div>
        </div>
        
        <div className="hero-stat-divider" />
        
        <div className="hero-stat">
          <div className="hero-stat-value">
            <AnimatedValue value={parseFloat(feesCollected)} prefix="$" suffix="K" decimals={2} />
          </div>
          <div className="hero-stat-label">Fees Earned</div>
        </div>
      </div>
      
      <style jsx>{`
        .hero {
          position: relative;
          padding: 4rem 0 3rem;
          text-align: center;
          overflow: hidden;
        }
        
        .hero-glow-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .hero-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
        }
        
        .hero-glow-1 {
          width: 500px;
          height: 400px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%);
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          animation: float1 8s ease-in-out infinite;
        }
        
        .hero-glow-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%);
          top: 50%;
          right: -100px;
          animation: float2 10s ease-in-out infinite;
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(20px); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #22c55e;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .hero-badge-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .hero-title {
          font-size: clamp(2.25rem, 7vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1rem;
          letter-spacing: -0.03em;
        }
        
        .hero-highlight {
          background: linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fcd34d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 520px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }
        
        .hero-cta {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        
        .hero-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
          flex-wrap: wrap;
          background: rgba(17, 17, 20, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 1.25rem 2rem;
          max-width: fit-content;
          margin: 0 auto;
        }
        
        .hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1.5rem;
        }
        
        .hero-stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border);
        }
        
        .hero-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .hero-stat-label {
          font-size: 0.6875rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.25rem;
        }
        
        @media (max-width: 640px) {
          .hero {
            padding: 3rem 0 2rem;
          }
          
          .hero-stats {
            padding: 1rem 1.25rem;
          }
          
          .hero-stat {
            padding: 0 1rem;
          }
          
          .hero-stat-value {
            font-size: 1.25rem;
          }
          
          .hero-stat-divider {
            height: 30px;
          }
        }
      `}</style>
    </section>
  );
}
