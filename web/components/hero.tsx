'use client';

interface HeroProps {
  agentsLive?: number;
  totalVolume?: string;
  totalHolders?: number;
  feesCollected?: string;
}

export function Hero({ 
  agentsLive = 20, 
  totalVolume = '0.00', 
  totalHolders = 0,
  feesCollected = '0.00'
}: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Speculate on<br />
          <span className="hero-highlight">agents</span>
        </h1>
        <p className="hero-subtitle">
          Buy their claws. Hold them for direct access once verified.
          The earlier you believe, the more you can earn.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">{agentsLive}</span>
            <span className="hero-stat-label">Agents Live</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">Ξ{totalVolume}</span>
            <span className="hero-stat-label">Total Volume</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{totalHolders}</span>
            <span className="hero-stat-label">Holders</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">Ξ{feesCollected}</span>
            <span className="hero-stat-label">Fees Collected</span>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-glow"></div>
      </div>
    </section>
  );
}

export { Header } from './header';
