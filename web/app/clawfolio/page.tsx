'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, AGENTS, formatETH } from '@/lib/agents';
import { useClawBalance, useCurrentPrice } from '@/hooks/useClaws';
import { TradeModal } from '@/components/trade-modal';

// Single holding row - clickable
function HoldingRow({ agent, userAddress, onTrade }: { 
  agent: ReturnType<typeof getAgentList>[0]; 
  userAddress: `0x${string}`;
  onTrade: (handle: string) => void;
}) {
  const { balance, isLoading } = useClawBalance(agent.xHandle, userAddress);
  const { priceETH } = useCurrentPrice(agent.xHandle);
  
  const claws = balance !== undefined ? Number(balance) : 0;
  const value = (priceETH || 0) * claws;
  
  if (!isLoading && claws === 0) return null;
  
  return (
    <div 
      onClick={() => onTrade(agent.xHandle)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: '1px solid var(--grey-800)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--grey-900)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img 
          src={agent.xProfileImage || `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`}
          alt={agent.name}
          width={48}
          height={48}
          style={{ borderRadius: '50%' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`;
          }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{agent.name}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grey-500)' }}>@{agent.xHandle}</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600 }}>
          {isLoading ? '...' : `${claws} claw${claws !== 1 ? 's' : ''}`}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--grey-400)' }}>
          ≈ {isLoading ? '...' : value < 0.0001 ? '<0.0001' : formatETH(value)} ETH
        </div>
      </div>
    </div>
  );
}

export default function ClawfolioPage() {
  const { address, isConnected } = useAccount();
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
          Your <span style={{ color: 'var(--red)' }}>Clawfolio</span>
        </h1>
        <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
          Tap any agent to buy or sell
        </p>
        
        {!isConnected ? (
          <div style={{ 
            background: 'var(--black-surface)', 
            borderRadius: '12px',
            border: '1px solid var(--grey-800)',
            padding: '3rem',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--grey-400)', marginBottom: '1.5rem' }}>
              Connect your wallet to view your holdings
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div style={{ 
            background: 'var(--black-surface)', 
            borderRadius: '12px',
            border: '1px solid var(--grey-800)',
          }}>
            {agents.map((agent) => (
              <HoldingRow 
                key={agent.xHandle} 
                agent={agent} 
                userAddress={address!}
                onTrade={(handle) => setTradeModal({ isOpen: true, handle })}
              />
            ))}
            
            <div style={{ 
              padding: '1.5rem', 
              textAlign: 'center', 
              color: 'var(--grey-600)',
              fontSize: '0.875rem',
            }}>
              Only agents you hold claws in appear here
            </div>
          </div>
        )}
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
