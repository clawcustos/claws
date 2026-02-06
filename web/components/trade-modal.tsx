'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  useMarket, 
  useBuyPrice, 
  useSellPrice, 
  useBuyClaws, 
  useSellClaws,
  useClawBalance,
  useETHBalance 
} from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentHandle: string;
  agentImage: string;
  initialMode?: 'buy' | 'sell';
  isVerified?: boolean;
}

function formatUSDWithPrice(eth: number, ethPriceUsd: number): string {
  if (isNaN(eth) || eth === 0) return '$0';
  const usd = eth * ethPriceUsd;
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(2)}K`;
}

function formatETHValue(eth: number): string {
  if (isNaN(eth) || eth === 0) return '0';
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
  initialMode = 'buy',
  isVerified: isVerifiedProp,
}: TradeModalProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);
  const [amount, setAmount] = useState('1');
  const [imgError, setImgError] = useState(false);
  const { isConnected, address } = useAccount();
  const { ethPrice } = useETHPrice();
  
  const amountNum = parseInt(amount) || (amount === '' ? 0 : 0);
  
  // Fetch real data from contract
  const { market, isLoading: marketLoading } = useMarket(agentHandle);
  const { balance: userBalance } = useClawBalance(agentHandle, address);
  const { balanceETH } = useETHBalance();
  
  // Verified status from contract (or prop fallback)
  const isVerified = market?.isVerified ?? isVerifiedProp ?? false;
  
  // Safe number conversions
  const supply = market?.supply !== undefined ? Number(market.supply) : 0;
  const userClaws = userBalance !== undefined ? Number(userBalance) : 0;
  const ethBalance = isNaN(balanceETH) ? 0 : balanceETH;
  
  // Get real prices from contract
  const { totalCost: buyCostWei, totalCostETH: buyCostETH, isLoading: buyPriceLoading } = useBuyPrice(agentHandle, amountNum);
  const { proceeds: sellProceedsWei, proceedsETH: sellProceedsETH, isLoading: sellPriceLoading } = useSellPrice(agentHandle, amountNum);
  
  // Trade functions
  const { buyClaws, isPending: isBuying, hash: buyHash, error: buyError } = useBuyClaws();
  const { sellClaws, isPending: isSelling, hash: sellHash, error: sellError } = useSellClaws();
  
  // Wait for transaction confirmations
  const { isLoading: isBuyConfirming, isSuccess: buyConfirmed } = useWaitForTransactionReceipt({ hash: buyHash });
  const { isLoading: isSellConfirming, isSuccess: sellConfirmed } = useWaitForTransactionReceipt({ hash: sellHash });
  
  const isTrading = isBuying || isSelling || isBuyConfirming || isSellConfirming;
  const isPriceLoading = mode === 'buy' ? buyPriceLoading : sellPriceLoading;
  
  // Safe price values
  const displayPrice = mode === 'buy' ? (buyCostETH || 0) : (sellProceedsETH || 0);
  const isFree = supply === 0 && mode === 'buy' && amountNum === 1;

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
    // Strip leading zeros
    const cleaned = value.replace(/^0+/, '') || '';
    const num = parseInt(cleaned) || 0;
    if (mode === 'sell' && num > userClaws) {
      setAmount(Math.max(0, userClaws).toString());
    } else {
      setAmount(cleaned);
    }
  };

  const handleTrade = async () => {
    if (!isConnected || amountNum === 0) return;
    
    try {
      if (mode === 'buy' && buyCostWei !== undefined) {
        await buyClaws(agentHandle, amountNum, buyCostWei);
      } else if (mode === 'sell' && sellProceedsWei !== undefined) {
        // For very small proceeds (dust), set minProceeds to 0 to avoid rounding issues
        const minProceeds = sellProceedsWei < 100000n ? 0n : (sellProceedsWei * 95n) / 100n;
        await sellClaws(agentHandle, amountNum, minProceeds);
      }
    } catch (err) {
      console.error('Trade failed:', err);
    }
  };

  // Validation
  const insufficientETH = mode === 'buy' && !isFree && displayPrice > ethBalance;
  const insufficientClaws = mode === 'sell' && amountNum > userClaws;
  // Liquidity check: free claws have no ETH backing
  // First claw is always free for everyone (no ETH backing)
  // Verification no longer gives a free claw
  const freeClaws = 1;
  const paidSupply = Math.max(0, supply - freeClaws); // claws backed by real ETH
  const noLiquidity = mode === 'sell' && paidSupply === 0;
  
  const cantSellAll = mode === 'sell' && amountNum >= supply; // Contract: CannotSellLastClaw
  // Can only sell up to the number of paid claws (free claws have no ETH backing)
  const exceedsPaidSupply = mode === 'sell' && amountNum > paidSupply && paidSupply > 0;
  
  const canBuy = mode === 'buy' && amountNum > 0 && !insufficientETH;
  const canSell = mode === 'sell' && amountNum > 0 && !insufficientClaws && !cantSellAll && !noLiquidity && !exceedsPaidSupply;
  const canTrade = mode === 'buy' ? canBuy : canSell;
  
  // Human-readable error message
  const getErrorMessage = () => {
    if (mode === 'sell' && noLiquidity) {
      return `No liquidity — all ${supply} claw${supply !== 1 ? 's' : ''} in this market were claimed for free. Someone needs to buy claws at market price before selling is possible.`;
    }
    if (mode === 'sell' && exceedsPaidSupply) {
      return `Only ${paidSupply} claw${paidSupply !== 1 ? 's' : ''} have ETH backing. Max sellable: ${paidSupply}`;
    }
    if (insufficientETH) {
      const needed = (displayPrice - ethBalance).toFixed(4);
      return `Insufficient ETH. You need ${needed} more ETH.`;
    }
    if (insufficientClaws) {
      return `You only have ${userClaws} claw${userClaws !== 1 ? 's' : ''} to sell.`;
    }
    if (cantSellAll) {
      return `Cannot sell all claws. Market must keep at least 1. Max sellable: ${supply - 1}`;
    }
    return null;
  };
  
  const validationError = getErrorMessage();

  if (!isOpen) return null;

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  };

  const modalStyle: React.CSSProperties = {
    background: '#111',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    position: 'relative',
    border: '1px solid #333',
  };

  const closeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#999',
    fontSize: '28px',
    cursor: 'pointer',
    zIndex: 10,
    padding: '8px',
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  };

  const statsRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  };

  const statStyle: React.CSSProperties = {
    textAlign: 'center' as const,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
  };

  const toggleStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    background: active ? '#dc2626' : '#222',
    color: active ? '#fff' : '#888',
  });

  const inputSectionStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const inputLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#888',
    marginBottom: '8px',
    display: 'block',
  };

  const inputWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    background: '#1a1a1a',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '12px',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    fontWeight: '600',
    outline: 'none',
    width: '100%',
  };

  const quickAmountsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
  };

  const quickBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    border: '1px solid #333',
    borderRadius: '6px',
    background: active ? '#dc2626' : 'transparent',
    color: active ? '#fff' : '#888',
    cursor: 'pointer',
  });

  const summaryStyle: React.CSSProperties = {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    minHeight: '110px',
  };

  const summaryRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const tradeBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    background: canTrade && !isTrading ? '#dc2626' : '#333',
    color: canTrade && !isTrading ? '#fff' : '#666',
    fontSize: '16px',
    fontWeight: '600',
    cursor: canTrade && !isTrading ? 'pointer' : 'not-allowed',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <button style={closeStyle} onClick={onClose}>×</button>
        
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img 
              src={imgError ? `https://ui-avatars.com/api/?name=${agentName}&background=dc2626&color=fff&size=64` : agentImage}
              alt={agentName}
              width={64}
              height={64}
              style={{ borderRadius: '50%', border: isVerified ? '2px solid #dc2626' : '2px solid transparent' }}
              onError={() => setImgError(true)}
            />
            {isVerified && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', border: '2px solid #111',
              }}>✓</div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <a 
                href={`/agent/${agentHandle}`}
                style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: 700, textDecoration: 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                {agentName}
              </a>
              {isVerified && (
                <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, background: 'rgba(220,38,38,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  VERIFIED
                </span>
              )}
            </div>
            <a 
              href={`https://x.com/${agentHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#888', textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              @{agentHandle}
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={statsRowStyle}>
          <div style={statStyle}>
            <div style={statLabelStyle}>Supply</div>
            <div style={statValueStyle}>{marketLoading ? '...' : supply}</div>
          </div>
          <div style={statStyle}>
            <div style={statLabelStyle}>Your Claws</div>
            <div style={statValueStyle}>{userClaws}</div>
          </div>
          <div style={statStyle}>
            <div style={statLabelStyle}>Your ETH</div>
            <div style={statValueStyle}>{formatETHValue(ethBalance)}</div>
          </div>
        </div>

        {/* Toggle */}
        <div style={toggleStyle}>
          <button style={toggleBtnStyle(mode === 'buy')} onClick={() => setMode('buy')}>
            Buy
          </button>
          <button style={toggleBtnStyle(mode === 'sell')} onClick={() => setMode('sell')}>
            Sell
          </button>
        </div>

        {/* Amount */}
        <div style={inputSectionStyle}>
          <label style={inputLabelStyle}>Amount (whole claws only)</label>
          <div style={inputWrapperStyle}>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              style={inputStyle}
              placeholder="1"
            />
            <span style={{ color: '#666', fontSize: '14px' }}>CLAWS</span>
          </div>
          <div style={quickAmountsStyle}>
            {[1, 2, 5, 10].map(val => (
              <button 
                key={val} 
                style={quickBtnStyle(amountNum === val)}
                onClick={() => setAmount(val.toString())}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={summaryStyle}>
          <div style={summaryRowStyle}>
            <span style={{ color: '#888' }}>{mode === 'buy' ? 'Total Cost' : 'You Receive'}</span>
            <span style={{ color: '#fff', fontWeight: '600' }}>
              {isPriceLoading ? '...' : isFree ? (
                <span style={{ color: '#22c55e' }}>FREE</span>
              ) : (
                `${formatETHValue(displayPrice)} ETH`
              )}
            </span>
          </div>
          <div style={{ ...summaryRowStyle, marginTop: '8px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>≈ USD</span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              {isPriceLoading ? '...' : formatUSDWithPrice(displayPrice, ethPrice)}
            </span>
          </div>
          {isFree && (
            <div style={{ color: '#22c55e', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>
              First claw is FREE
            </div>
          )}
          {mode === 'sell' && !sellPriceLoading && sellProceedsETH > 0 && sellProceedsETH < 0.0001 && !validationError && (
            <div style={{ color: '#f59e0b', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>
              ⚠️ Very low proceeds — this market has minimal liquidity
            </div>
          )}
          {validationError && (
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '12px', textAlign: 'center', fontWeight: '500' }}>
              {validationError}
            </div>
          )}
        </div>

        {/* Trade Button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button style={tradeBtnStyle} onClick={openConnectModal}>
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        ) : (
          <button style={tradeBtnStyle} onClick={handleTrade} disabled={!canTrade || isTrading}>
            {isTrading 
              ? (isBuyConfirming || isSellConfirming ? 'Confirming...' : 'Processing...') 
              : `${mode === 'buy' ? 'Buy' : 'Sell'} ${amountNum} Claw${amountNum !== 1 ? 's' : ''}`
            }
          </button>
        )}
        
        {/* Transaction Status */}
        {(buyHash || sellHash) && (
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
            {buyConfirmed || sellConfirmed ? (
              <span style={{ color: '#22c55e' }}>✓ Transaction confirmed!</span>
            ) : (
              <a 
                href={`https://basescan.org/tx/${buyHash || sellHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#dc2626' }}
              >
                View on Basescan →
              </a>
            )}
          </div>
        )}
        
        {/* Error Display - only show if not a validation error */}
        {(buyError || sellError) && !validationError && (
          <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>
            {(() => {
              const err = (buyError || sellError)?.message || '';
              // User-friendly error messages
              if (err.includes('insufficient funds') || err.includes('exceeds balance')) {
                return 'Insufficient ETH balance for this transaction.';
              }
              if (err.includes('user rejected') || err.includes('User rejected')) {
                return 'Transaction cancelled.';
              }
              if (err.includes('Missing or invalid parameters')) {
                return 'Unable to process. Please try a smaller amount.';
              }
              // Fallback - show truncated message
              return err.slice(0, 80) + (err.length > 80 ? '...' : '');
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
