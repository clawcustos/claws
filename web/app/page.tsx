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
      <div id="trending" className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Mobile: Leaderboard first, then agents */}
          <div className="lg:hidden">
            <h2 className="text-xl font-bold text-white mb-4">🏆 Top Agents</h2>
            <Leaderboard />
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
              🔥 Trending Agents
            </h2>
            <AgentList />
          </div>
          
          {/* Desktop: Leaderboard in sidebar */}
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold text-white mb-6">🏆 Leaderboard</h2>
            <Leaderboard />
          </div>
        </div>
        
        {/* Coming Soon Banner */}
        <div className="mt-8 md:mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 md:p-6 text-center">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
            More agents coming soon
          </h3>
          <p className="text-sm md:text-base text-gray-400">
            Currently featuring 20 curated agents. Soon you&apos;ll be able to speculate on any verified agent.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 md:py-8 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built on Base • <a href="https://twitter.com/claws_tech" className="hover:text-white transition">@claws_tech</a></p>
        </div>
      </footer>
    </main>
  );
}
