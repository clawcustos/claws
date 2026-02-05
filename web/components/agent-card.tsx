'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatETH, calculateCurrentPrice, type AgentListItem } from '@/lib/agents';
import { TradeModal } from './trade-modal';

interface AgentCardProps {
  agent: AgentListItem;
}

const AGENT_EMOJIS: Record<string, string> = {
  bankrbot: '💰',
  moltbook: '🦀',
  clawdbotatg: '🦞',
  clawnch: '🚀',
  kellyclaudeai: '🤖',
  starkbotai: '⚡',
  clawcustos: '🏛️',
  clawstr: '🦞',
  molten: '🔥',
  clawdvine: '🍇',
  clawdia: '✨',
  clawcaster: '📡',
  lobchanai: '🦞',
  solvrbot: '🔧',
  moltcaster: '📺',
};

// ETH price for USD display
const ETH_PRICE_USD = 3000;

function formatUSD(eth: number): string {
  const usd = eth * ETH_PRICE_USD;
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(1)}K`;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const { isConnected } = useAccount();
  
  const emoji = AGENT_EMOJIS[agent.xHandle.toLowerCase()] || '🤖';
  const isPositive = agent.priceChange24h >= 0;
  
  const handleTradeClick = (e: React.MouseEvent, mode: 'buy' | 'sell') => {
    e.preventDefault();
    e.stopPropagation();
    setTradeMode(mode);
    setIsTradeModalOpen(true);
  };
  
  return (
    <>
      <div className={`agent-card ${agent.clawsVerified ? 'verified' : ''}`}>
        {/* Header - Clickable to go to profile */}
        <Link href={`/agent/${agent.xHandle}`} className="agent-card-header" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="agent-avatar">
            {emoji}
          </div>
          
          <div className="agent-info">
            <div className="agent-name-row">
              <span className="agent-name">{agent.name}</span>
              {agent.clawsVerified && (
                <span className="badge-verified">✓</span>
              )}
            </div>
            <div className="agent-handle">@{agent.xHandle}</div>
          </div>
        </Link>
        
        {/* Price Section - BIG */}
        <div className="agent-price-section">
          <div className="agent-current-price">
            {formatETH(agent.priceETH)} Ξ
          </div>
          <div className="agent-price-usd">
            {formatUSD(agent.priceETH)}
          </div>
          <div className={`agent-price-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(agent.priceChange24h).toFixed(1)}%
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="agent-stats">
          <div className="agent-stat">
            <div className="agent-stat-value">{agent.supply}</div>
            <div className="agent-stat-label">Supply</div>
          </div>
          <div className="agent-stat">
            <div className="agent-stat-value">{agent.volume24h || '-'}</div>
            <div className="agent-stat-label">24h Vol</div>
          </div>
        </div>
        
        {/* Inline Trade Buttons */}
        <div className="agent-trade-buttons">
          {isConnected ? (
            <>
              <button 
                className="agent-trade-btn buy"
                onClick={(e) => handleTradeClick(e, 'buy')}
              >
                Buy
              </button>
              <button 
                className="agent-trade-btn sell"
                onClick={(e) => handleTradeClick(e, 'sell')}
              >
                Sell
              </button>
            </>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button 
                  className="agent-trade-btn buy"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openConnectModal();
                  }}
                  style={{ gridColumn: '1 / -1' }}
                >
                  Connect to Trade
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </div>
      
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        agentName={agent.name}
        agentHandle={agent.xHandle}
        currentPriceETH={agent.priceETH}
        supply={agent.supply}
        initialMode={tradeMode}
      />
    </>
  );
}
