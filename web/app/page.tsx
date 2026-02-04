import { AgentList } from "@/components/agent-list";
import { Hero } from "@/components/hero";
import { Leaderboard } from "@/components/leaderboard";

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
