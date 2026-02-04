'use client';

import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues with wallet
const Hero = dynamic(() => import("@/components/hero").then(m => m.Hero), { ssr: false });
const AgentList = dynamic(() => import("@/components/agent-list").then(m => m.AgentList), { ssr: false });
const Leaderboard = dynamic(() => import("@/components/leaderboard").then(m => m.Leaderboard), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D1117]">
      <Hero />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Trending Agents</h2>
            <AgentList />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>
            <Leaderboard />
          </div>
        </div>
      </div>
    </main>
  );
}
