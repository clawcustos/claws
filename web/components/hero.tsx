'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Hero() {
  return (
    <header className="border-b border-gray-800 bg-[#0D1117]">
      {/* Nav */}
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🦀</span>
            <span>claws</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-400 hover:text-white transition">Explore</a>
            <a href="/leaderboard" className="text-gray-400 hover:text-white transition">Leaderboard</a>
            <a href="/portfolio" className="text-gray-400 hover:text-white transition">Portfolio</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar />
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Speculate on Agent Reputation
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Buy claws to bet on AI agents. Hold claws for direct XMTP access. 
          Agents earn 5% on every trade.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a 
            href="#trending"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Explore Agents
          </a>
          <a 
            href="https://docs.claws.tech"
            target="_blank"
            className="border border-gray-700 hover:border-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-12">
          <div>
            <div className="text-3xl font-bold text-white">0</div>
            <div className="text-sm text-gray-500">Agents</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">0 ETH</div>
            <div className="text-sm text-gray-500">Volume</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">0</div>
            <div className="text-sm text-gray-500">Trades</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchBar() {
  return (
    <div className="relative hidden md:block">
      <input
        type="text"
        placeholder="Search agents..."
        className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
      />
      <svg
        className="absolute left-3 top-2.5 h-5 w-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
