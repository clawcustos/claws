'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { getAgentList, formatETH } from '@/lib/agents';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';
import { TradeModal } from '@/components/trade-modal';

// Individual row — exposes data for parent sorting
function useAgentData(handle: string) {
  const { market, isLoading } = useMarket(handle);
  const { priceETH } = useCurrentPrice(handle);
  
  const supply = market?.supply !== undefined ? Number(market.supply) : 0;
  const price = priceETH || 0;
  const isVerified = market?.isVerified || false;
  const lifetimeFeesETH = market?.lifetimeFees ? parseFloat(formatEther(market.lifetimeFees)) : 0;
  
  return { supply, price, isVerified, lifetimeFeesETH, isLoading };
}

function LeaderboardRow({ agent, rank, onTrade, ethUsd }: { 
  agent: ReturnType<typeof getAgentList>[0]; 
  rank: number;
  onTrade: (handle: string) => void;
  ethUsd: number;
}) {
  const { supply, price, isVerified, lifetimeFeesETH, isLoading } = useAgentData(agent.xHandle);
  const feesUsd = lifetimeFeesETH * ethUsd;
  
  return (
    <div className="leaderboard-item" onClick={() => onTrade(agent.xHandle)}>
      <div className={`leaderboard-rank ${rank <= 3 ? ['', 'gold', 'silver', 'bronze'][rank] : ''}`}>
        {rank}
      </div>
      
      <div className="leaderboard-agent">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img 
            src={agent.xProfileImage || `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`}
            alt={agent.name}
            width={36}
            height={36}
            className={isVerified ? 'leaderboard-verified-ring' : ''}
            style={{ borderRadius: '50%', width: 36, height: 36, objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`;
            }}
          />
          {isVerified && <div className="leaderboard-verified-badge">✓</div>}
        </div>
        <div style={{ minWidth: 0 }}>
          <Link 
            href={`/agent/${agent.xHandle}`}
            className="leaderboard-name"
            style={{ 
              color: 'inherit', textDecoration: 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              display: 'block', fontSize: '0.875rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {agent.name}
          </Link>
          <div className="leaderboard-handle" style={{ fontSize: '0.6875rem' }}>@{agent.xHandle}</div>
        </div>
      </div>
      
      <div className="leaderboard-price" style={{ fontSize: '0.8125rem' }}>
        {isLoading ? '...' : supply === 0 ? (
          <span className="badge-free">FREE</span>
        ) : (
          <span className="mono">{price < 0.0001 ? '<0.0001' : formatETH(price)} ETH</span>
        )}
      </div>
      
      <div className="leaderboard-fees">
        {isLoading ? '...' : lifetimeFeesETH === 0 ? (
          <span style={{ color: 'var(--grey-600)' }}>—</span>
        ) : (
          <div>
            <span className="leaderboard-fees-value">
              {lifetimeFeesETH < 0.0001 ? '<0.0001' : formatETH(lifetimeFeesETH)}
            </span>
            {feesUsd > 0.01 && (
              <div className="leaderboard-fees-usd">
                ${feesUsd < 1 ? feesUsd.toFixed(2) : feesUsd.toFixed(0)}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="leaderboard-supply" style={{ fontSize: '0.8125rem' }}>
        {isLoading ? '...' : supply}
      </div>
    </div>
  );
}

type SortKey = 'rank' | 'price' | 'fees';
type SortDir = 'asc' | 'desc';

// Sortable header button
function SortHeader({ label, sortKey, currentSort, currentDir, onSort, className, style }: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isActive = currentSort === sortKey;
  return (
    <div 
      className={className}
      style={{ 
        ...style, 
        cursor: 'pointer', 
        userSelect: 'none',
        color: isActive ? 'var(--red)' : undefined,
      }}
      onClick={() => onSort(sortKey)}
    >
      {label} {isActive ? (currentDir === 'desc' ? '↓' : '↑') : ''}
    </div>
  );
}

export default function LeaderboardPage() {
  const agents = useMemo(() => getAgentList(), []);
  const { ethPrice: ethUsd } = useETHPrice();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
  }>({ isOpen: false, handle: '' });
  
  const selectedAgent = agents.find(a => a.xHandle === tradeModal.handle);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc'); // default to highest first
    }
  };

  return (
    <>
      <main style={{ padding: 'calc(var(--header-height) + var(--ticker-height, 32px) + 1rem) 1rem calc(var(--nav-height, 70px) + env(safe-area-inset-bottom, 0px) + 2rem)', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          <span className="text-red">Top</span> Agents
        </h1>
        <p className="text-grey" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Live from the Claws contract on Base
        </p>

        {/* $CLAWS Token Disclaimer */}
        <div style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--grey-300)',
          lineHeight: 1.5,
        }}>
          <span style={{ color: 'var(--red)', fontWeight: 700 }}>⚠️ $CLAWS token is not yet live.</span>{' '}
          Anyone claiming otherwise is a scam. Official information will only be posted on{' '}
          <a href="https://x.com/claws_tech" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', textDecoration: 'underline' }}>@claws_tech</a>{' '}
          and displayed on this site.
        </div>
        
        {/* Table */}
        <div className="leaderboard">
          <div className="leaderboard-header">
            <SortHeader label="#" sortKey="rank" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} style={{ textAlign: 'center' }} />
            <div>Agent</div>
            <SortHeader label="Price" sortKey="price" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} style={{ textAlign: 'right' }} />
            <SortHeader label="Fees" sortKey="fees" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} style={{ textAlign: 'right' }} />
            <div className="leaderboard-supply">Supply</div>
          </div>
          
          {agents.map((agent, i) => (
            <LeaderboardRow 
              key={agent.xHandle} 
              agent={agent} 
              rank={i + 1}
              onTrade={(handle) => setTradeModal({ isOpen: true, handle })}
              ethUsd={ethUsd}
            />
          ))}
        </div>
      </main>
      
      {selectedAgent && (
        <TradeModal
          isOpen={tradeModal.isOpen}
          onClose={() => setTradeModal({ isOpen: false, handle: '' })}
          agentName={selectedAgent.name}
          agentHandle={selectedAgent.xHandle}
          agentImage={selectedAgent.xProfileImage || `https://ui-avatars.com/api/?name=${selectedAgent.name}&background=dc2626&color=fff`}
        />
      )}
    </>
  );
}
