'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { calculateBuyPrice, calculateSellPrice, calculateCurrentPrice, formatETH } from '@/lib/agents';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentHandle: string;
  agentImage: string;
  currentPriceETH: number;
  supply: number;
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

export function TradeModal({ 
  isOpen, 
  onClose, 
  agentName, 
  agentHandle,
  agentImage,
  currentPriceETH,
  supply,
  initialMode = 'buy'
}: TradeModalProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);
  const [amount, setAmount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useAccount();
  
  const amountNum = parseInt(amount) || 0;
  
  // Calculate prices
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

  const newSupply = mode === 'buy' ? supply + amountNum : Math.max(0, supply - amountNum);
  const newPrice = calculateCurrentPrice(newSupply);

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
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-agent">
            <div className="modal-avatar">
              <Image src={agentImage} alt={agentName} width={48} height={48} unoptimized />
            </div>
            <div>
              <div className="modal-title">{agentName}</div>
              <div className="modal-handle">@{agentHandle}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Current Price */}
        <div style={{ 
          background: 'var(--black)', 
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Current Price
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {formatETH(currentPriceETH)} ETH
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grey-500)' }}>
            {formatUSD(currentPriceETH)}
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
        <div className="trade-input-wrap">
          <div className="trade-input-label">
            <span>Amount</span>
            <span>Supply: {supply}</span>
          </div>
          <div className="trade-input-box">
            <input
              type="text"
              className="trade-input"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              inputMode="numeric"
            />
            <span className="trade-input-suffix">claws</span>
          </div>
          
          <div className="trade-quick">
            <button className="trade-quick-btn" onClick={() => setQuickAmount(1)}>1</button>
            <button className="trade-quick-btn" onClick={() => setQuickAmount(5)}>5</button>
            <button className="trade-quick-btn" onClick={() => setQuickAmount(10)}>10</button>
            {mode === 'sell' && supply > 1 && (
              <button className="trade-quick-btn" onClick={() => setQuickAmount(supply - 1)}>MAX</button>
            )}
          </div>
        </div>
        
        {/* Summary */}
        <div className="trade-summary">
          <div className="trade-row">
            <span>{mode === 'buy' ? 'Cost' : 'Value'}</span>
            <span>{formatETH(basePrice)} ETH</span>
          </div>
          <div className="trade-row muted">
            <span>Protocol fee (5%)</span>
            <span>{formatETH(protocolFee)} ETH</span>
          </div>
          <div className="trade-row muted">
            <span>Agent fee (5%)</span>
            <span>{formatETH(agentFee)} ETH</span>
          </div>
          <div className="trade-row total">
            <span>{mode === 'buy' ? 'Total' : 'You receive'}</span>
            <span style={{ color: mode === 'sell' ? 'var(--green)' : 'inherit' }}>
              {formatETH(Math.abs(totalCost))} ETH
            </span>
          </div>
        </div>
        
        {/* CTA */}
        <div className="trade-cta">
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button className="btn btn-red trade-btn" onClick={openConnectModal}>
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          ) : (
            <button 
              className={`btn trade-btn ${mode === 'buy' ? 'btn-buy' : 'btn-sell'}`}
              disabled={amountNum === 0 || isLoading}
              onClick={handleTrade}
            >
              {isLoading ? 'Processing...' : `${mode === 'buy' ? 'Buy' : 'Sell'} ${amountNum} Claw${amountNum !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
        
        <p className="trade-note">
          {mode === 'buy' 
            ? 'Price increases with each purchase. Early = cheaper.'
            : 'Cannot sell the last claw.'}
        </p>
      </div>
    </div>
  );
}
