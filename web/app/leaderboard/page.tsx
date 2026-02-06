'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getAgentList, formatETH } from '@/lib/agents';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';
import { TradeModal } from '@/components/trade-modal';

// Single leaderboard row
function LeaderboardRow({ agent, rank, onTrade }: { 
  agent: ReturnType<typeof getAgentList>[0]; 
  rank: number;
  onTrade: (handle: string) => void;
}) {
  const { market, isLoading } = useMarket(agent.xHandle);
  const { priceETH } = useCurrentPrice(agent.xHandle);
  
  const supply = market?.supply !== undefined ? Number(market.supply) : 0;
  const price = priceETH || 0;
  const isVerified = market?.isVerified || false;
  
  return (
    <div 
      onClick={() => onTrade(agent.xHandle)}
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr 80px 60px',
        alignItems: 'center',
        padding: '0.875rem 1rem',
        borderBottom: '1px solid var(--grey-800)',
        gap: '0.75rem',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--grey-900)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ 
        color: rank <= 3 ? 'var(--red)' : 'var(--grey-500)',
        fontWeight: 600,
        fontSize: '0.875rem',
      }}>
        {rank}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
        <img 
          src={agent.xProfileImage || `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`}
          alt={agent.name}
          width={36}
          height={36}
          style={{ borderRadius: '50%', flexShrink: 0 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`;
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</span>
            {isVerified && <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)' }}>@{agent.xHandle}</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
        {isLoading ? '...' : supply === 0 ? (
          <span style={{ color: '#22c55e' }}>FREE</span>
        ) : (
          <span>{price < 0.0001 ? '<0.0001' : formatETH(price)} ETH</span>
        )}
      </div>
      
      <div style={{ textAlign: 'right', color: 'var(--grey-400)', fontSize: '0.875rem' }}>
        {isLoading ? '...' : supply}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const agents = useMemo(() => getAgentList(), []);
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
  }>({ isOpen: false, handle: '' });
  
  const selectedAgent = agents.find(a => a.xHandle === tradeModal.handle);

  return (
    <>
      <main style={{ padding: '5rem 1rem 6rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--red)' }}>Top</span> by Price
        </h1>
        <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Live from the Claws contract on Base
        </p>
        
        {/* Table */}
        <div style={{ 
          background: 'var(--black-surface)', 
          borderRadius: '12px',
          border: '1px solid var(--grey-800)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 80px 60px',
            padding: '0.625rem 1rem',
            borderBottom: '1px solid var(--grey-700)',
            fontSize: '0.6875rem',
            color: 'var(--grey-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            gap: '0.75rem',
          }}>
            <div>#</div>
            <div>Agent</div>
            <div style={{ textAlign: 'right' }}>Price</div>
            <div style={{ textAlign: 'right' }}>Supply</div>
          </div>
          
          {/* Rows */}
          {agents.map((agent, i) => (
            <LeaderboardRow 
              key={agent.xHandle} 
              agent={agent} 
              rank={i + 1}
              onTrade={(handle) => setTradeModal({ isOpen: true, handle })}
            />
          ))}
        </div>
      </main>
      
      {/* Trade Modal */}
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
