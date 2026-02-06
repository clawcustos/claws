'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';
import { ERC8004Badge } from '@/components/erc8004-badge';
import type { AgentListItem } from '@/lib/agents';

// Generate initials avatar
function getInitialsAvatar(name: string): string {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['991b1b', 'b91c1c', 'dc2626', 'ef4444', '7f1d1d'];
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const bg = colors[colorIndex];
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#${bg}" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="#fff" font-family="system-ui" font-weight="600" font-size="36">${initials}</text></svg>`)}`;
}

interface AgentCardProps {
  agent: AgentListItem;
  onTrade: (handle: string, mode: 'buy' | 'sell') => void;
  onConnect: () => void;
  /** Filter by live verified status: 'all' shows always, 'verified'/'unverified' hides if mismatch, 'trending' shows only active markets */
  verifiedFilter?: 'all' | 'verified' | 'unverified' | 'trending';
}

export function AgentCard({ agent, onTrade, onConnect, verifiedFilter = 'all' }: AgentCardProps) {
  const { isConnected } = useAccount();
  const [imgError, setImgError] = useState(false);
  
  // Fetch real data from contract
  const { market, isLoading } = useMarket(agent.xHandle);
  const { priceETH } = useCurrentPrice(agent.xHandle);
  const { ethPrice } = useETHPrice();
  
  // Use real data if available, otherwise show zeros
  const supply = market ? Number(market.supply) : 0;
  const isVerified = market?.isVerified || false;
  const verifiedWallet = market?.verifiedWallet;
  const currentPriceETH = priceETH || 0;
  
  // Filter by verified status (using live contract data)
  if (!isLoading && verifiedFilter === 'verified' && !isVerified) return null;
  if (!isLoading && verifiedFilter === 'unverified' && isVerified) return null;
  // Trending: only show markets with actual trades (supply > 1, meaning someone bought beyond free claw)
  if (!isLoading && verifiedFilter === 'trending' && supply <= 1) return null;
  
  const handleBuy = () => {
    if (isConnected) {
      onTrade(agent.xHandle, 'buy');
    } else {
      onConnect();
    }
  };
  
  const handleSell = () => {
    if (isConnected) {
      onTrade(agent.xHandle, 'sell');
    } else {
      onConnect();
    }
  };
  
  // Format price for display
  const formatPrice = (eth: number): string => {
    if (eth === 0) return 'FREE';
    if (eth < 0.0001) return '<0.0001';
    if (eth < 0.01) return eth.toFixed(4);
    if (eth < 1) return eth.toFixed(3);
    return eth.toFixed(2);
  };
  
  const formatUSD = (eth: number): string => {
    const usd = eth * ethPrice;
    if (usd === 0) return '$0';
    if (usd < 0.01) return '<$0.01';
    if (usd < 1) return `$${usd.toFixed(2)}`;
    if (usd < 1000) return `$${usd.toFixed(0)}`;
    return `$${(usd / 1000).toFixed(1)}K`;
  };
  
  return (
    <div className={`agent-card ${isVerified ? 'verified' : ''}`}>
      <div className="agent-header">
        <div className="agent-avatar">
          <img 
            src={imgError ? getInitialsAvatar(agent.name) : agent.xProfileImage} 
            alt={agent.name}
            width={48}
            height={48}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="agent-info">
          <Link href={`/agent/${agent.xHandle}`} className="agent-name" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {agent.name}
            {isVerified && <span className="verified-badge">✓</span>}
            {isVerified && <ERC8004Badge walletAddress={verifiedWallet} />}
          </Link>
          <a 
            href={`https://x.com/${agent.xHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="agent-handle"
          >
            @{agent.xHandle}
          </a>
        </div>
      </div>
      
      <div className="agent-price">
        {isLoading ? (
          <div className="agent-price-eth" style={{ color: 'var(--grey-500)' }}>Loading...</div>
        ) : (
          <>
            <div className="agent-price-eth">
              {supply === 0 ? (
                <span style={{ color: 'var(--red-500)' }}>FREE</span>
              ) : (
                `${formatPrice(currentPriceETH)} ETH`
              )}
            </div>
            <div className="agent-price-usd">
              {supply === 0 ? 'First claw free!' : formatUSD(currentPriceETH)}
            </div>
          </>
        )}
      </div>
      
      <div className="agent-stats">
        <div className="agent-stat">
          <div className="agent-stat-value">{isLoading ? '...' : supply}</div>
          <div className="agent-stat-label">Supply</div>
        </div>
        <div className="agent-stat">
          <div className="agent-stat-value">{isVerified ? '✓' : '—'}</div>
          <div className="agent-stat-label">Verified</div>
        </div>
      </div>
      
      <div className="agent-actions">
        <button 
          className="agent-action buy"
          onClick={handleBuy}
        >
          {supply === 0 ? 'GET FREE' : 'BUY'}
        </button>
        <button 
          className="agent-action sell"
          onClick={handleSell}
          disabled={supply === 0}
          style={supply === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          SELL
        </button>
      </div>
    </div>
  );
}
