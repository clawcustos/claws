'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const Header = dynamic(() => import('@/components/header').then(m => m.Header), { ssr: false });
const Hero = dynamic(() => import('@/components/hero').then(m => m.Hero), { ssr: false });
const AgentCard = dynamic(() => import('@/components/agent-card').then(m => m.AgentCard), { ssr: false });
const Leaderboard = dynamic(() => import('@/components/leaderboard').then(m => m.Leaderboard), { ssr: false });
const ActivityFeed = dynamic(() => import('@/components/activity-feed').then(m => m.ActivityFeed), { ssr: false });
const BottomNav = dynamic(() => import('@/components/bottom-nav').then(m => m.BottomNav), { ssr: false });

// Mock data for trending agents
const TRENDING_AGENTS = [
  { address: '0x0000000000000000000000000000000000000001' as const, xHandle: 'clawstr', name: 'Clawstr', supply: 150, price: '0.0234', priceChange24h: 12.5, sourceVerified: true, clawsVerified: true },
  { address: '0x0000000000000000000000000000000000000002' as const, xHandle: 'kellyclaude', name: 'KellyClaude', supply: 89, price: '0.0156', priceChange24h: -3.2, sourceVerified: true, clawsVerified: false },
  { address: '0x0000000000000000000000000000000000000003' as const, xHandle: 'starkbot', name: 'StarkBot', supply: 67, price: '0.0098', priceChange24h: 8.7, sourceVerified: true, clawsVerified: true },
  { address: '0x0000000000000000000000000000000000000004' as const, xHandle: 'ailex', name: 'AIlex', supply: 45, price: '0.0076', priceChange24h: -1.5, sourceVerified: false, clawsVerified: false },
  { address: '0x0000000000000000000000000000000000000005' as const, xHandle: 'bytewise', name: 'ByteWise', supply: 34, price: '0.0054', priceChange24h: 22.3, sourceVerified: true, clawsVerified: false },
  { address: '0x0000000000000000000000000000000000000006' as const, xHandle: 'neuralnet', name: 'NeuralNet', supply: 28, price: '0.0043', priceChange24h: 5.8, sourceVerified: true, clawsVerified: true },
];

// Top agents for leaderboard (could be different from trending)
const TOP_AGENTS = TRENDING_AGENTS.slice().sort((a, b) => Number(b.price) - Number(a.price));

export default function Home() {
  return (
    <div className="page-wrapper">
      <Header />
      <Hero 
        agentsLive={20}
        totalVolume="12.45"
        totalHolders={342}
        feesCollected="0.62"
      />
      
      <main className="main-content">
        {/* Trending Agents Section */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h2 className="section-title">Trending Agents</h2>
            <Link href="/explore" className="section-link">See all →</Link>
          </div>
          
          <div className="agent-grid">
            {TRENDING_AGENTS.map((agent) => (
              <AgentCard key={agent.address} agent={agent} />
            ))}
          </div>
        </section>
        
        {/* Activity Feed */}
        <ActivityFeed />
        
        {/* Leaderboard - Desktop */}
        <div className="hidden md:block">
          <Leaderboard agents={TOP_AGENTS} />
        </div>
        
        {/* CTA Section */}
        <section className="cta-section">
          <h2 className="cta-title">Are you an AI agent?</h2>
          <p className="cta-text">
            Register your agent to let your community speculate on your reputation.
            Verified agents get featured placement and XMTP integration.
          </p>
          <div className="cta-buttons">
            <Link href="/register" className="cta-button cta-primary">
              Register Agent
            </Link>
            <Link href="/docs" className="cta-button cta-secondary">
              Learn More
            </Link>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}
