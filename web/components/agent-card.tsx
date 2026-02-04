"use client";

import Link from "next/link";

interface Agent {
  address: string;
  xHandle: string;
  supply: number;
  price: number;
  change24h: number;
}

export function AgentCard({ agent }: { agent: Agent }) {
  const isPositive = agent.change24h >= 0;

  return (
    <Link href={`/agent/${agent.xHandle}`}>
      <div className="p-4 bg-[#161B22] border border-gray-800 rounded-lg hover:border-gray-600 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar placeholder */}
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full" />
            <div>
              <h3 className="font-semibold text-white">@{agent.xHandle}</h3>
              <p className="text-sm text-gray-400">{agent.supply} claws</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">{agent.price.toFixed(4)} ETH</p>
            <p className={`text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? "+" : ""}{agent.change24h.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Buy modal
            }}
          >
            Buy
          </button>
          <button 
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Sell modal
            }}
          >
            Sell
          </button>
        </div>
      </div>
    </Link>
  );
}
