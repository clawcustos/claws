'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Address, formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { Hero } from '@/components/hero';
import { TradeModal } from '@/components/trade-modal';
import { 
  useAgentStatus, 
  useClawsBalance, 
  useBuyPrice,
  formatPrice 
} from '@/lib/hooks';

export default function AgentPage() {
  const params = useParams();
  const agentAddress = params.address as Address;
  const { address: userAddress } = useAccount();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const { data: status } = useAgentStatus(agentAddress);
  const { data: userBalance } = useClawsBalance(agentAddress, userAddress);
  const { data: buyPrice } = useBuyPrice(agentAddress, 1n);

  const [sourceVerified, clawsVerified, reservedClawClaimed, pendingFees, supply] = status || [];

  // Mock data - replace with real data from indexer
  const agent = {
    address: agentAddress,
    name: 'Agent',
    xHandle: 'agent',
    avatar: '🤖',
    earnings: pendingFees ? formatPrice(pendingFees) : '0',
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <Hero />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl">
                    {agent.avatar}
                  </div>
                  {clawsVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                    {sourceVerified && (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                        moltbook verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">@{agent.xHandle}</p>
                  <p className="text-sm text-gray-600 mt-2 font-mono">
                    {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)}
                  </p>
                </div>

                <button
                  onClick={() => setIsTradeModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  Trade
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
                <div>
                  <div className="text-2xl font-bold text-white">{supply?.toString() || '0'}</div>
                  <div className="text-sm text-gray-500">Supply</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatPrice(buyPrice)} ETH</div>
                  <div className="text-sm text-gray-500">Price</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">-</div>
                  <div className="text-sm text-gray-500">Holders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{agent.earnings} ETH</div>
                  <div className="text-sm text-gray-500">Earnings</div>
                </div>
              </div>
            </div>

            {/* Price Chart Placeholder */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Price History</h2>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart coming soon
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Trades</h2>
              <div className="text-gray-500 text-center py-8">
                No trades yet
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Position */}
            {userAddress && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Position</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Claws Held</span>
                    <span className="text-white font-medium">{userBalance?.toString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Value</span>
                    <span className="text-white font-medium">-</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => setIsTradeModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setIsTradeModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
                    disabled={!userBalance || userBalance === 0n}
                  >
                    Sell
                  </button>
                </div>
              </div>
            )}

            {/* Holders */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Holders</h3>
              <div className="text-gray-500 text-center py-4">
                No holders yet
              </div>
            </div>

            {/* XMTP Access */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">XMTP Access</h3>
              <p className="text-sm text-gray-400 mb-4">
                Hold claws to unlock direct messaging with this agent.
              </p>
              {userBalance && userBalance > 0n ? (
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition">
                  Open Chat
                </button>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  Buy claws to unlock
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <TradeModal
        agent={agentAddress}
        agentName={agent.name}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
    </div>
  );
}
