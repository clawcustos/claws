'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';
import { 
  useMarket, 
  useBuyPrice, 
  useSellPrice, 
  useBuyClaws, 
  useSellClaws,
  useClawBalance,
  useETHBalance 
} from '@/hooks/useClaws';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentHandle: string;
  agentImage: string;
  initialMode?: 'buy' | 'sell';
}

const ETH_PRICE_USD = 3000;

function formatUSD(eth: number): string {
  const usd = eth * ETH_PRICE_USD;
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(2)}K`;
}

function formatETH(eth: number): string {
  if (eth === 0) return 'FREE';
  if (eth < 0.0001) return '<0.0001';
  if (eth < 0.01) return eth.toFixed(4);
  if (eth < 1) return eth.toFixed(3);
  return eth.toFixed(2);
}

export function TradeModal({ 
  isOpen, 
  onClose, 
  agentName, 
  agentHandle,
  agentImage,
  initialMode = 'buy'
}: TradeModalProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);
  const [amount, setAmount] = useState('1');
  const { isConnected, address } = useAccount();
  
  const amountNum = parseInt(amount) || 0;
  
  // Fetch real data from contract
  const { market, refetch: refetchMarket } = useMarket(agentHandle);
  const { balance: userBalance, refetch: refetchBalance } = useClawBalance(agentHandle, address);
  const { balanceETH } = useETHBalance();
  
  const supply = market ? Number(market.supply) : 0;
  const userClaws = userBalance ? Number(userBalance) : 0;
  
  // Get real prices from contract
  const { totalCost: buyCostWei, totalCostETH: buyCostETH, isLoading: buyPriceLoading } = useBuyPrice(agentHandle, amountNum);
  const { proceeds: sellProceedsWei, proceedsETH: sellProceedsETH, isLoading: sellPriceLoading } = useSellPrice(agentHandle, amountNum);
  
  // Trade functions
  const { buyClaws, isPending: isBuying, isSuccess: buySuccess, hash: buyHash, error: buyError } = useBuyClaws();
  const { sellClaws, isPending: isSelling, isSuccess: sellSuccess, hash: sellHash, error: sellError } = useSellClaws();
  
  // Wait for transaction confirmations
  const { isLoading: isBuyConfirming, isSuccess: buyConfirmed } = useWaitForTransactionReceipt({ hash: buyHash });
  const { isLoading: isSellConfirming, isSuccess: sellConfirmed } = useWaitForTransactionReceipt({ hash: sellHash });
  
  const isLoading = isBuying || isSelling || isBuyConfirming || isSellConfirming;
  const isPriceLoading = mode === 'buy' ? buyPriceLoading : sellPriceLoading;
  
  // Calculate display values
  const totalCostETH = mode === 'buy' ? buyCostETH : sellProceedsETH;
  const priceLabel = mode === 'buy' ? 'Total Cost' : 'You Receive';
  
  // Refetch data after successful trade
  useEffect(() => {
    if (buyConfirmed || sellConfirmed) {
      refetchMarket();
      refetchBalance();
    }
  }, [buyConfirmed, sellConfirmed, refetchMarket, refetchBalance]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setMode(initialMode);
      setAmount('1');
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, initialMode]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const num = parseInt(value) || 0;
    // For sell, can't sell all claws (would leave supply at 0)
    if (mode === 'sell' && num >= userClaws) {
      setAmount(Math.max(0, userClaws).toString());
    } else {
      setAmount(value || '0');
    }
  };

  const setQuickAmount = (val: number) => {
    if (mode === 'sell' && val > userClaws) {
      setAmount(userClaws.toString());
    } else {
      setAmount(val.toString());
    }
  };

  const handleTrade = async () => {
    if (!isConnected || amountNum === 0) return;
    
    try {
      if (mode === 'buy' && buyCostWei) {
        await buyClaws(agentHandle, amountNum, buyCostWei);
      } else if (mode === 'sell' && sellProceedsWei) {
        // Use 95% of expected proceeds as min (5% slippage tolerance)
        const minProceeds = (sellProceedsWei * 95n) / 100n;
        await sellClaws(agentHandle, amountNum, minProceeds);
      }
    } catch (err) {
      console.error('Trade failed:', err);
    }
  };

  const canBuy = mode === 'buy' && amountNum > 0 && buyCostETH <= balanceETH;
  const canSell = mode === 'sell' && amountNum > 0 && amountNum <= userClaws && supply > amountNum;
  const canTrade = mode === 'buy' ? canBuy : canSell;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content trade-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        
        {/* Agent Header */}
        <div className="trade-agent-header">
          <div className="trade-agent-image">
            <Image 
              src={agentImage} 
              alt={agentName}
              width={64}
              height={64}
              style={{ borderRadius: '50%' }}
            />
          </div>
          <div className="trade-agent-info">
            <h3>{agentName}</h3>
            <div className="trade-agent-handle">@{agentHandle}</div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="trade-market-stats">
          <div className="trade-stat">
            <span className="trade-stat-label">Supply</span>
            <span className="trade-stat-value">{supply}</span>
          </div>
          <div className="trade-stat">
            <span className="trade-stat-label">Your Claws</span>
            <span className="trade-stat-value">{userClaws}</span>
          </div>
          <div className="trade-stat">
            <span className="trade-stat-label">Your ETH</span>
            <span className="trade-stat-value">{balanceETH.toFixed(4)}</span>
          </div>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="trade-mode-toggle">
          <button 
            className={`toggle-btn ${mode === 'buy' ? 'active' : ''}`}
            onClick={() => { setMode('buy'); setAmount('1'); }}
          >
            Buy
          </button>
          <button 
            className={`toggle-btn ${mode === 'sell' ? 'active' : ''}`}
            onClick={() => { setMode('sell'); setAmount('1'); }}
          >
            Sell
          </button>
        </div>

        {/* Amount Input */}
        <div className="trade-input-section">
          <label>Amount (whole claws only)</label>
          <div className="trade-input-wrapper">
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="trade-input"
              placeholder="1"
            />
            <span className="trade-input-suffix">CLAWS</span>
          </div>
          <div className="quick-amounts">
            {[1, 2, 5, 10].map(val => (
              <button 
                key={val} 
                onClick={() => setQuickAmount(val)}
                className={amountNum === val ? 'active' : ''}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="trade-summary">
          <div className="trade-summary-row">
            <span>{priceLabel}</span>
            <span className="trade-price">
              {isPriceLoading ? '...' : `${formatETH(totalCostETH)} ETH`}
              <span className="trade-price-usd">
                ({isPriceLoading ? '...' : formatUSD(totalCostETH)})
              </span>
            </span>
          </div>
          {supply === 0 && mode === 'buy' && amountNum === 1 && (
            <div className="trade-summary-note" style={{ color: 'var(--red-500)', marginTop: '0.5rem' }}>
              🎉 First claw is FREE!
            </div>
          )}
          {mode === 'buy' && buyCostETH > balanceETH && (
            <div className="trade-summary-note" style={{ color: 'var(--red-500)', marginTop: '0.5rem' }}>
              Insufficient ETH balance
            </div>
          )}
          {mode === 'sell' && amountNum > userClaws && (
            <div className="trade-summary-note" style={{ color: 'var(--red-500)', marginTop: '0.5rem' }}>
              You only have {userClaws} claws
            </div>
          )}
        </div>

        {/* Trade Button */}
        {!isConnected ? (
          <div className="trade-connect-wrapper">
            <ConnectButton />
          </div>
        ) : (
          <button 
            className={`trade-btn ${mode === 'buy' ? 'buy' : 'sell'}`}
            onClick={handleTrade}
            disabled={!canTrade || isLoading}
          >
            {isLoading 
              ? (isBuyConfirming || isSellConfirming ? 'Confirming...' : 'Processing...') 
              : `${mode === 'buy' ? 'Buy' : 'Sell'} ${amountNum} Claw${amountNum !== 1 ? 's' : ''}`
            }
          </button>
        )}
        
        {/* Transaction Status */}
        {(buyHash || sellHash) && (
          <div className="trade-tx-status" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            {buyConfirmed || sellConfirmed ? (
              <span style={{ color: 'var(--green-500)' }}>✓ Transaction confirmed!</span>
            ) : (
              <a 
                href={`https://basescan.org/tx/${buyHash || sellHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--red-500)' }}
              >
                View on Basescan →
              </a>
            )}
          </div>
        )}
        
        {/* Error Display */}
        {(buyError || sellError) && (
          <div className="trade-error" style={{ marginTop: '1rem', color: 'var(--red-500)', fontSize: '0.875rem' }}>
            {(buyError || sellError)?.message?.slice(0, 100)}
          </div>
        )}
      </div>
    </div>
  );
}
