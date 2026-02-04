'use client';

import { useState } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useBuyPrice, useSellPrice, useBuyClaws, useSellClaws, useClawsBalance, formatPrice } from '@/lib/hooks';

interface TradeModalProps {
  agent: Address;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TradeModal({ agent, agentName, isOpen, onClose }: TradeModalProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState(1);
  
  const { address } = useAccount();
  const { data: buyPrice } = useBuyPrice(agent, BigInt(amount));
  const { data: sellPrice } = useSellPrice(agent, BigInt(amount));
  const { data: balance } = useClawsBalance(agent, address);
  
  const { buy, isPending: isBuying, isConfirming: isConfirmingBuy } = useBuyClaws();
  const { sell, isPending: isSelling, isConfirming: isConfirmingSell } = useSellClaws();

  if (!isOpen) return null;

  const price = mode === 'buy' ? buyPrice : sellPrice;
  const isLoading = isBuying || isSelling || isConfirmingBuy || isConfirmingSell;
  const userBalance = balance ? Number(balance) : 0;

  const handleTrade = () => {
    if (mode === 'buy' && buyPrice) {
      buy(agent, BigInt(amount), buyPrice);
    } else if (mode === 'sell') {
      sell(agent, BigInt(amount));
    }
  };

  const canSell = mode === 'sell' && userBalance >= amount;
  const canTrade = mode === 'buy' ? !!buyPrice : canSell;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Trade {agentName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMode('buy')}
              className={`flex-1 py-2 rounded-md font-medium transition ${
                mode === 'buy' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setMode('sell')}
              className={`flex-1 py-2 rounded-md font-medium transition ${
                mode === 'sell' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="px-4 pb-4">
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAmount(Math.max(1, amount - 1))}
              className="w-10 h-10 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition"
            >
              -
            </button>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-center text-white text-lg font-medium focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => setAmount(amount + 1)}
              className="w-10 h-10 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition"
            >
              +
            </button>
          </div>
          {mode === 'sell' && (
            <div className="text-sm text-gray-500 mt-2">
              Your balance: {userBalance} claws
            </div>
          )}
        </div>

        {/* Price */}
        <div className="px-4 pb-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                {mode === 'buy' ? 'Total Cost' : 'You Receive'}
              </span>
              <span className="text-xl font-semibold text-white">
                {formatPrice(price)} ETH
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Includes 10% fees (5% protocol + 5% agent)
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleTrade}
            disabled={!canTrade || isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              mode === 'buy'
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800'
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-800'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isConfirmingBuy || isConfirmingSell ? 'Confirming...' : 'Processing...'}
              </span>
            ) : mode === 'buy' ? (
              `Buy ${amount} Claw${amount > 1 ? 's' : ''}`
            ) : (
              `Sell ${amount} Claw${amount > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
