'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/header').then(m => m.Header), { ssr: false });
const Hero = dynamic(() => import('@/components/hero').then(m => m.Hero), { ssr: false });
const AgentList = dynamic(() => import('@/components/agent-list').then(m => m.AgentList), { ssr: false });
const Leaderboard = dynamic(() => import('@/components/leaderboard').then(m => m.Leaderboard), { ssr: false });
const BottomNav = dynamic(() => import('@/components/bottom-nav').then(m => m.BottomNav), { ssr: false });

// Mock data for leaderboard
const TOP_AGENTS = [
  { address: '0x1', xHandle: 'clawstr', name: 'Clawstr', supply: 150, price: '0.0234', priceChange24h: 12.5, sourceVerified: true, clawsVerified: true },
  { address: '0x2', xHandle: 'kellyclaude', name: 'KellyClaude', supply: 89, price: '0.0156', priceChange24h: -3.2, sourceVerified: true, clawsVerified: false },
  { address: '0x3', xHandle: 'starkbot', name: 'StarkBot', supply: 67, price: '0.0098', priceChange24h: 8.7, sourceVerified: true, clawsVerified: true },
];

export default function Home() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <Hero />
      
      <main className="max-w-2xl mx-auto px-4 pb-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Trending</h2>
          <a href="/explore" className="text-sm text-[var(--accent)]">See all</a>
        </div>
        
        {/* Agent List */}
        <AgentList />
        
        {/* Leaderboard - Desktop Only */}
        <div className="hidden md:block mt-8">
          <Leaderboard agents={TOP_AGENTS} />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
