'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { getAgentList, formatETH } from '@/lib/agents';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';
import { TradeModal } from '@/components/trade-modal';

// Single leaderboard row
function LeaderboardRow({ agent, rank, onTrade, ethUsd }: { 
  agent: ReturnType<typeof getAgentList>[0]; 
  rank: number;
  onTrade: (handle: string) => void;
  ethUsd: number;
}) {
  const { market, isLoading } = useMarket(agent.xHandle);
  const { priceETH } = useCurrentPrice(agent.xHandle);
  
  const supply = market?.supply !== undefined ? Number(market.supply) : 0;
  const price = priceETH || 0;
  const isVerified = market?.isVerified || false;
  const feesETH = market?.pendingFees ? parseFloat(formatEther(market.pendingFees)) : 0;
  const feesUsd = feesETH * ethUsd;
  
  return (
    <div 
      onClick={() => onTrade(agent.xHandle)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.875rem 1rem',
        borderBottom: '1px solid var(--grey-800)',
        gap: '0.75rem',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--black-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Rank */}
      <div style={{ 
        color: rank <= 3 ? 'var(--red)' : 'var(--grey-500)',
        fontWeight: 700,
        fontSize: '0.875rem',
        width: '24px',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        {rank}
      </div>
      
      {/* Avatar + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img 
            src={agent.xProfileImage || `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`}
            alt={agent.name}
            width={36}
            height={36}
            style={{ 
              borderRadius: '50%',
              border: isVerified ? '2px solid var(--red)' : '2px solid transparent',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`;
            }}
          />
          {isVerified && (
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'var(--red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.5rem',
              border: '2px solid var(--black)',
            }}>
              ✓
            </div>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <Link 
            href={`/agent/${agent.xHandle}`}
            style={{ 
              fontWeight: 600, 
              fontSize: '0.875rem', 
              color: 'inherit', 
              textDecoration: 'none',
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              display: 'block',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {agent.name}
          </Link>
          <div style={{ fontSize: '0.6875rem', color: 'var(--grey-500)' }}>@{agent.xHandle}</div>
        </div>
      </div>
      
      {/* Price */}
      <div style={{ textAlign: 'right', fontSize: '0.8125rem', flexShrink: 0 }}>
        {isLoading ? '...' : supply === 0 ? (
          <span style={{ 
            color: 'var(--red)', background: 'rgba(220,38,38,0.15)', 
            padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700,
          }}>FREE</span>
        ) : (
          <span className="mono">{price < 0.0001 ? '<0.0001' : formatETH(price)} ETH</span>
        )}
      </div>
      
      {/* Fees Earned */}
      <div style={{ textAlign: 'right', fontSize: '0.8125rem', flexShrink: 0, minWidth: '54px' }}>
        {isLoading ? '...' : feesETH === 0 ? (
          <span style={{ color: 'var(--grey-600)' }}>—</span>
        ) : (
          <div>
            <span className="mono" style={{ color: 'var(--green, #22c55e)' }}>
              {feesETH < 0.0001 ? '<0.0001' : formatETH(feesETH)}
            </span>
            {feesUsd > 0.01 && (
              <div style={{ fontSize: '0.625rem', color: 'var(--grey-500)' }}>
                ${feesUsd < 1 ? feesUsd.toFixed(2) : feesUsd.toFixed(0)}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Supply */}
      <div style={{ textAlign: 'right', color: 'var(--grey-400)', fontSize: '0.8125rem', width: '40px', flexShrink: 0 }}>
        {isLoading ? '...' : supply}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const agents = useMemo(() => getAgentList(), []);
  const { ethUsd } = useETHPrice();
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
  }>({ isOpen: false, handle: '' });
  
  const selectedAgent = agents.find(a => a.xHandle === tradeModal.handle);

  return (
    <>
      <main style={{ padding: 'calc(var(--header-height) + 1rem) 1rem calc(var(--nav-height, 70px) + env(safe-area-inset-bottom, 0px) + 2rem)', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--red)' }}>Top</span> Agents
        </h1>
        <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
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
        <div style={{ 
          background: 'var(--black-surface)', 
          borderRadius: '12px',
          border: '1px solid var(--grey-800)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            padding: '0.625rem 1rem',
            borderBottom: '1px solid var(--grey-700)',
            fontSize: '0.625rem',
            color: 'var(--grey-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            gap: '0.75rem',
          }}>
            <div style={{ width: '24px', textAlign: 'center' }}>#</div>
            <div style={{ flex: 1 }}>Agent</div>
            <div style={{ textAlign: 'right' }}>Price</div>
            <div style={{ textAlign: 'right', minWidth: '54px' }}>Fees</div>
            <div style={{ textAlign: 'right', width: '40px' }}>Supply</div>
          </div>
          
          {/* Rows */}
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
