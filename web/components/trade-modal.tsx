'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentEmoji } from '@/lib/agents';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentHandle: string;
  currentPrice: string;
  supply: number;
}

// Bonding curve: price = supply² / 160000 USDC
function calculateBuyPrice(supply: number, amount: number): number {
  // Sum of squares formula for bonding curve
  const endSupply = supply + amount;
  const sumEnd = (endSupply * (endSupply + 1) * (2 * endSupply + 1)) / 6;
  const sumStart = (supply * (supply + 1) * (2 * supply + 1)) / 6;
  const sumSquares = sumEnd - sumStart;
  return (sumSquares * 1e6) / 160000 / 1e6; // USDC has 6 decimals
}

function calculateSellPrice(supply: number, amount: number): number {
  if (amount > supply || amount === 0) return 0;
  const newSupply = supply - amount;
  const sumEnd = (supply * (supply + 1) * (2 * supply + 1)) / 6;
  const sumStart = (newSupply * (newSupply + 1) * (2 * newSupply + 1)) / 6;
  const sumSquares = sumEnd - sumStart;
  return (sumSquares * 1e6) / 160000 / 1e6;
}

function formatUSD(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function TradeModal({ 
  isOpen, 
  onClose, 
  agentName, 
  agentHandle,
  currentPrice,
  supply 
}: TradeModalProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  
  const amountNum = parseInt(amount) || 0;
  const emoji = getAgentEmoji(agentHandle);
  
  // Calculate prices
  const basePrice = mode === 'buy' 
    ? calculateBuyPrice(supply, amountNum)
    : calculateSellPrice(supply, amountNum);
  
  const protocolFee = basePrice * 0.05;
  const agentFee = basePrice * 0.05;
  
  const totalCost = mode === 'buy' 
    ? basePrice + protocolFee + agentFee
    : basePrice - protocolFee - agentFee;

  // Preview new supply after trade
  const newSupply = mode === 'buy' ? supply + amountNum : supply - amountNum;
  const newPrice = mode === 'buy'
    ? calculateBuyPrice(newSupply, 1)
    : calculateBuyPrice(Math.max(0, newSupply), 1);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setAmount('1');
      setMode('buy');
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const num = parseInt(value) || 0;
    // Limit to available supply for sells
    if (mode === 'sell' && num > supply) {
      setAmount(supply.toString());
    } else {
      setAmount(value || '0');
    }
  };

  const setQuickAmount = (val: number) => {
    if (mode === 'sell' && val > supply) {
      setAmount(supply.toString());
    } else {
      setAmount(val.toString());
    }
  };

  const handleTrade = async () => {
    if (!isConnected || amountNum === 0) return;
    
    setIsLoading(true);
    // TODO: Implement actual contract call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-agent-info">
            <div className="modal-avatar">{emoji}</div>
            <div>
              <h2 className="modal-title">Trade {agentName}</h2>
              <span className="modal-handle">@{agentHandle}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="trade-tabs">
          <button 
            className={`trade-tab ${mode === 'buy' ? 'active buy' : ''}`}
            onClick={() => setMode('buy')}
          >
            Buy
          </button>
          <button 
            className={`trade-tab ${mode === 'sell' ? 'active sell' : ''}`}
            onClick={() => setMode('sell')}
          >
            Sell
          </button>
        </div>
        
        {/* Amount Input */}
        <div className="trade-input-group">
          <div className="trade-input-label">
            <span>Amount</span>
            <span className="trade-input-supply">Supply: {supply}</span>
          </div>
          <div className="trade-input-wrapper">
            <input
              type="text"
              className="trade-input"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <span className="trade-input-suffix">claws</span>
          </div>
          
          <div className="trade-amounts">
            <button className="trade-amount-btn" onClick={() => setQuickAmount(1)}>1</button>
            <button className="trade-amount-btn" onClick={() => setQuickAmount(5)}>5</button>
            <button className="trade-amount-btn" onClick={() => setQuickAmount(10)}>10</button>
            <button className="trade-amount-btn" onClick={() => setQuickAmount(25)}>25</button>
            {mode === 'sell' && (
              <button className="trade-amount-btn max" onClick={() => setQuickAmount(supply)}>MAX</button>
            )}
          </div>
        </div>
        
        {/* Price Summary */}
        <div className="trade-summary">
          <div className="trade-summary-row">
            <span className="trade-summary-label">Current price</span>
            <span className="trade-summary-value mono">${currentPrice}</span>
          </div>
          <div className="trade-summary-row">
            <span className="trade-summary-label">
              {mode === 'buy' ? 'Cost' : 'Value'} ({amountNum} claw{amountNum !== 1 ? 's' : ''})
            </span>
            <span className="trade-summary-value mono">{formatUSD(basePrice)}</span>
          </div>
          <div className="trade-summary-row muted">
            <span className="trade-summary-label">Protocol fee (5%)</span>
            <span className="trade-summary-value mono">{formatUSD(protocolFee)}</span>
          </div>
          <div className="trade-summary-row muted">
            <span className="trade-summary-label">Agent fee (5%)</span>
            <span className="trade-summary-value mono">{formatUSD(agentFee)}</span>
          </div>
          <div className="trade-summary-divider" />
          <div className="trade-summary-row total">
            <span className="trade-summary-label">
              {mode === 'buy' ? 'Total cost' : 'You receive'}
            </span>
            <span className={`trade-summary-value mono ${mode === 'sell' ? 'positive' : ''}`}>
              {formatUSD(Math.abs(totalCost))}
            </span>
          </div>
          
          {/* Price impact preview */}
          <div className="trade-impact">
            <span>New price after trade:</span>
            <span className="mono">${newPrice.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="trade-action">
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button 
                  className="btn btn-primary trade-btn"
                  onClick={openConnectModal}
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          ) : (
            <button 
              className={`btn trade-btn ${mode === 'buy' ? 'btn-positive' : 'btn-negative'}`}
              disabled={amountNum === 0 || isLoading}
              onClick={handleTrade}
            >
              {isLoading ? (
                <span className="spinner" />
              ) : (
                <>
                  {mode === 'buy' ? 'Buy' : 'Sell'} {amountNum} Claw{amountNum !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Info */}
        <p className="trade-info">
          {mode === 'buy' 
            ? '💡 Price increases with each purchase. Early is better.'
            : '⚠️ You can only sell claws you own.'
          }
        </p>
      </div>
    </div>
  );
}
