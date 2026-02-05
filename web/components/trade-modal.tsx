'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentEmoji, calculateBuyPrice, calculateSellPrice, calculateCurrentPrice, formatETH } from '@/lib/agents';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentHandle: string;
  currentPriceETH: number;
  supply: number;
  initialMode?: 'buy' | 'sell';
}

// ETH price for USD estimates (update as needed)
const ETH_PRICE_USD = 3000;

function formatUSD(eth: number): string {
  const usd = eth * ETH_PRICE_USD;
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(2)}K`;
}

export function TradeModal({ 
  isOpen, 
  onClose, 
  agentName, 
  agentHandle,
  currentPriceETH,
  supply,
  initialMode = 'buy'
}: TradeModalProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);
  const [amount, setAmount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  
  const amountNum = parseInt(amount) || 0;
  const emoji = getAgentEmoji(agentHandle);
  
  // Calculate prices using bonding curve
  const basePrice = useMemo(() => {
    if (amountNum === 0) return 0;
    return mode === 'buy' 
      ? calculateBuyPrice(supply, amountNum)
      : calculateSellPrice(supply, amountNum);
  }, [mode, supply, amountNum]);
  
  const protocolFee = basePrice * 0.05;
  const agentFee = basePrice * 0.05;
  
  const totalCost = mode === 'buy' 
    ? basePrice + protocolFee + agentFee
    : basePrice - protocolFee - agentFee;

  // Preview new supply and price after trade
  const newSupply = mode === 'buy' ? supply + amountNum : Math.max(0, supply - amountNum);
  const newPrice = calculateCurrentPrice(newSupply);

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

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAmount('1');
    }
  }, [isOpen, initialMode]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const num = parseInt(value) || 0;
    // Limit to available supply for sells (minus 1 to prevent selling last claw)
    if (mode === 'sell' && num >= supply) {
      setAmount(Math.max(0, supply - 1).toString());
    } else {
      setAmount(value || '0');
    }
  };

  const setQuickAmount = (val: number) => {
    if (mode === 'sell' && val >= supply) {
      setAmount(Math.max(0, supply - 1).toString());
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
        
        {/* Current Price Display */}
        <div 
          style={{ 
            background: 'var(--bg-elevated)', 
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Current Price (1 claw)
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {formatETH(currentPriceETH)} Ξ
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
            ≈ {formatUSD(currentPriceETH)}
          </div>
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
            {mode === 'sell' && supply > 1 && (
              <button className="trade-amount-btn max" onClick={() => setQuickAmount(supply - 1)}>MAX</button>
            )}
          </div>
        </div>
        
        {/* Price Summary */}
        <div className="trade-summary">
          <div className="trade-summary-row">
            <span className="trade-summary-label">
              {mode === 'buy' ? 'Cost' : 'Value'} ({amountNum} claw{amountNum !== 1 ? 's' : ''})
            </span>
            <span className="trade-summary-value mono">{formatETH(basePrice)} Ξ</span>
          </div>
          <div className="trade-summary-row muted">
            <span className="trade-summary-label">Protocol fee (5%)</span>
            <span className="trade-summary-value mono">{formatETH(protocolFee)} Ξ</span>
          </div>
          <div className="trade-summary-row muted">
            <span className="trade-summary-label">Agent fee (5%)</span>
            <span className="trade-summary-value mono">{formatETH(agentFee)} Ξ</span>
          </div>
          <div className="trade-summary-divider" />
          <div className="trade-summary-row total">
            <span className="trade-summary-label">
              {mode === 'buy' ? 'Total cost' : 'You receive'}
            </span>
            <span className={`trade-summary-value mono ${mode === 'sell' ? 'positive' : ''}`}>
              {formatETH(Math.abs(totalCost))} Ξ
            </span>
          </div>
          <div className="trade-summary-row" style={{ marginTop: '0.5rem' }}>
            <span className="trade-summary-label" style={{ color: 'var(--text-muted)' }}>
              ≈ USD
            </span>
            <span className="trade-summary-value" style={{ color: 'var(--text-muted)' }}>
              {formatUSD(Math.abs(totalCost))}
            </span>
          </div>
          
          {/* Price impact preview */}
          <div className="trade-impact">
            <span>New price after trade:</span>
            <span className="mono">{formatETH(newPrice)} Ξ ({formatUSD(newPrice)})</span>
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
                  {mode === 'buy' ? 'Buy' : 'Sell'} {amountNum} Claw{amountNum !== 1 ? 's' : ''} for {formatETH(Math.abs(totalCost))} Ξ
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Info */}
        <p className="trade-info">
          {mode === 'buy' 
            ? '💡 Price increases with each purchase. Early = cheaper.'
            : '⚠️ Cannot sell the last claw (market integrity).'
          }
        </p>
      </div>
    </div>
  );
}
