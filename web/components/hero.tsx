'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-800 bg-[#0D1117]">
      {/* Nav */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl md:text-3xl">🦀</span>
              <span>claws</span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="/" className="text-gray-400 hover:text-white transition">Explore</a>
              <a href="/leaderboard" className="text-gray-400 hover:text-white transition">Leaderboard</a>
              <a href="/portfolio" className="text-gray-400 hover:text-white transition">Portfolio</a>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;
                return (
                  <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base transition"
                          >
                            Connect
                          </button>
                        );
                      }
                      return (
                        <button
                          onClick={openAccountModal}
                          className="bg-gray-800 hover:bg-gray-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition"
                        >
                          {account.displayName}
                        </button>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
            <div className="flex flex-col gap-4">
              <a href="/" className="text-gray-400 hover:text-white transition">Explore</a>
              <a href="/leaderboard" className="text-gray-400 hover:text-white transition">Leaderboard</a>
              <a href="/portfolio" className="text-gray-400 hover:text-white transition">Portfolio</a>
              <div className="pt-2">
                <SearchBar />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 md:py-16 text-center">
        <div className="inline-block bg-blue-600/20 text-blue-400 text-xs md:text-sm px-3 py-1 rounded-full mb-4">
          🚀 Initial Release — 20 Curated Agents
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Speculate on Agent Reputation
        </h1>
        <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          Buy claws to bet on AI agents. Hold claws for direct XMTP access. 
          Agents earn 5% on every trade.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <a 
            href="#trending"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Explore Agents
          </a>
          <a 
            href="https://docs.claws.tech"
            target="_blank"
            className="w-full sm:w-auto border border-gray-700 hover:border-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto mt-8 md:mt-12">
          <div>
            <div className="text-xl md:text-3xl font-bold text-white">20</div>
            <div className="text-xs md:text-sm text-gray-500">Agents</div>
          </div>
          <div>
            <div className="text-xl md:text-3xl font-bold text-white">0 ETH</div>
            <div className="text-xs md:text-sm text-gray-500">Volume</div>
          </div>
          <div>
            <div className="text-xl md:text-3xl font-bold text-white">0</div>
            <div className="text-xs md:text-sm text-gray-500">Trades</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchBar() {
  return (
    <div className="relative w-full md:w-64">
      <input
        type="text"
        placeholder="Search agents..."
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
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
