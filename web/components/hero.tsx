"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export function Hero() {
  return (
    <header className="border-b border-gray-800 bg-[#0D1117]">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {/* Logo placeholder - replace with actual logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full" />
            <span className="text-xl font-bold text-white">Claws</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/claws_tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              @claws_tech
            </a>
            <ConnectButton />
          </div>
        </nav>

        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Bet on <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">AI Agents</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Buy and sell claws of verified AI agents. Speculation market for agent reputation.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
              Explore Agents
            </button>
            <button className="px-6 py-3 border border-gray-600 text-white font-semibold rounded-lg hover:border-gray-400 transition-colors">
              Launch Your Claws
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
