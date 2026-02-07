'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { getAgentList, formatETH, type AgentListItem } from '@/lib/agents';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';
import { TradeModal } from '@/components/trade-modal';

// Hook to get sortable data for one agent
function useAgentMarketData(handle: string) {
  const { market, isLoading } = useMarket(handle);
  const { priceETH } = useCurrentPrice(handle);
  return {
    handle,
    supply: market?.supply !== undefined ? Number(market.supply) : 0,
    price: priceETH || 0,
    isVerified: market?.isVerified || false,
    lifetimeFeesETH: market?.lifetimeFees ? parseFloat(formatEther(market.lifetimeFees)) : 0,
    isLoading,
  };
}

// Wrapper that fetches data for a single agent and reports it
function AgentDataCollector({ agent, ethUsd, onData, children }: {
  agent: AgentListItem;
  ethUsd: number;
  onData: (handle: string, data: { price: number; fees: number }) => void;
  children: (data: ReturnType<typeof useAgentMarketData> & { feesUsd: number }) => React.ReactNode;
}) {
  const data = useAgentMarketData(agent.xHandle);
  const feesUsd = data.lifetimeFeesETH * ethUsd;
  
  // Report data up for sorting (using a ref pattern would be better but this works)
  if (!data.isLoading) {
    // Schedule for next tick to avoid render-during-render
    queueMicrotask(() => onData(agent.xHandle, { price: data.price, fees: feesUsd }));
  }
  
  return <>{children({ ...data, feesUsd })}</>;
}

type SortKey = 'rank' | 'price' | 'fees';
type SortDir = 'asc' | 'desc';

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
      {label}{isActive ? (currentDir === 'desc' ? ' ↓' : ' ↑') : ''}
    </div>
  );
}

export default function LeaderboardPage() {
  const agents = useMemo(() => getAgentList(), []);
  const { ethPrice: ethUsd } = useETHPrice();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [agentData, setAgentData] = useState<Record<string, { price: number; fees: number }>>({});
  
  const [tradeModal, setTradeModal] = useState<{ isOpen: boolean; handle: string }>({ isOpen: false, handle: '' });
  const selectedAgent = agents.find(a => a.xHandle === tradeModal.handle);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleData = (handle: string, data: { price: number; fees: number }) => {
    setAgentData(prev => {
      if (prev[handle]?.price === data.price && prev[handle]?.fees === data.fees) return prev;
      return { ...prev, [handle]: data };
    });
  };

  // Sort agents based on collected data
  const sortedAgents = useMemo(() => {
    if (sortKey === 'rank') {
      return sortDir === 'asc' ? agents : [...agents].reverse();
    }
    
    return [...agents].sort((a, b) => {
      const aData = agentData[a.xHandle];
      const bData = agentData[b.xHandle];
      if (!aData && !bData) return 0;
      if (!aData) return 1;
      if (!bData) return -1;
      
      const aVal = sortKey === 'price' ? aData.price : aData.fees;
      const bVal = sortKey === 'price' ? bData.price : bData.fees;
      
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [agents, sortKey, sortDir, agentData]);

  return (
    <>
      <main className="main" style={{ paddingTop: 'calc(var(--header-height) + env(safe-area-inset-top, 0px) + var(--ticker-height, 32px) + 1rem)', paddingLeft: '1rem', paddingRight: '1rem', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          <img src="/claw-red-32.png" alt="" style={{ width: '22px', height: '22px', display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} /><span className="text-red">Top</span> Agents
        </h1>
        <p className="text-grey" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Live from the Claws contract on Base
        </p>

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
          Anyone claiming otherwise is a scam. Official info only on{' '}
          <a href="https://x.com/claws_tech" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', textDecoration: 'underline' }}>@claws_tech</a>.
        </div>
        
        <div className="leaderboard">
          <div className="leaderboard-header">
            <SortHeader label="#" sortKey="rank" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} style={{ textAlign: 'center' }} />
            <div>Agent</div>
            <SortHeader label="Price" sortKey="price" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} style={{ textAlign: 'center' }} />
            <SortHeader label="Earned" sortKey="fees" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} style={{ textAlign: 'center' }} />
            <div className="leaderboard-supply">Supply</div>
          </div>
          
          {sortedAgents.map((agent, i) => (
            <AgentDataCollector key={agent.xHandle} agent={agent} ethUsd={ethUsd} onData={handleData}>
              {(data) => (
                <div className="leaderboard-item" onClick={() => setTradeModal({ isOpen: true, handle: agent.xHandle })}>
                  <div className={`leaderboard-rank ${i < 3 ? ['gold', 'silver', 'bronze'][i] : ''}`}>
                    {i + 1}
                  </div>
                  
                  <div className="leaderboard-agent">
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img 
                        src={agent.xProfileImage || `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`}
                        alt={agent.name}
                        width={36} height={36}
                        className={data.isVerified ? 'leaderboard-verified-ring' : ''}
                        style={{ borderRadius: '50%', width: 36, height: 36, objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`;
                        }}
                      />
                      {data.isVerified && <div className="leaderboard-verified-badge">✓</div>}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link 
                        href={`/agent/${agent.xHandle}`}
                        style={{ color: 'inherit', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', fontSize: '0.875rem', fontWeight: 600 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {agent.name}
                      </Link>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--grey-500)' }}>@{agent.xHandle}</div>
                    </div>
                  </div>
                  
                  <div className="leaderboard-price" style={{ fontSize: '0.8125rem' }}>
                    {data.isLoading ? '...' : data.supply === 0 ? (
                      <span className="badge-free">FREE</span>
                    ) : (
                      <span className="mono">{data.price < 0.0001 ? '<0.0001' : formatETH(data.price)} ETH</span>
                    )}
                  </div>
                  
                  <div className="leaderboard-fees">
                    {data.isLoading ? '...' : data.feesUsd < 0.01 ? (
                      <span style={{ color: 'var(--grey-600)' }}>—</span>
                    ) : (
                      <span className="leaderboard-fees-value" style={{ fontSize: '0.8125rem' }}>
                        ${data.feesUsd < 1 ? data.feesUsd.toFixed(2) : data.feesUsd.toFixed(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="leaderboard-supply" style={{ fontSize: '0.8125rem' }}>
                    {data.isLoading ? '...' : data.supply}
                  </div>
                </div>
              )}
            </AgentDataCollector>
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
