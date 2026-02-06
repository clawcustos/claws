'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';
import { getAgentList, AGENTS, formatETH } from '@/lib/agents';
import { useClawBalance, useCurrentPrice, useMarket } from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';
import { TradeModal } from '@/components/trade-modal';

// Single holding row - clickable
function HoldingRow({ agent, userAddress, onTrade }: { 
  agent: ReturnType<typeof getAgentList>[0]; 
  userAddress: `0x${string}`;
  onTrade: (handle: string) => void;
}) {
  const { balance, isLoading } = useClawBalance(agent.xHandle, userAddress);
  const { priceETH } = useCurrentPrice(agent.xHandle);
  const { market } = useMarket(agent.xHandle);
  
  const claws = balance !== undefined ? Number(balance) : 0;
  const value = (priceETH || 0) * claws;
  const isVerified = market?.isVerified || false;
  
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
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--black-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={agent.xProfileImage || `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`}
            alt={agent.name}
            width={48}
            height={48}
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
              bottom: '-2px',
              right: '-2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              border: '2px solid var(--black)',
            }}>
              ✓
            </div>
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {agent.name}
          </div>
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
  const { data: ethBalance } = useBalance({ address, query: { enabled: isConnected } });
  const { ethPrice } = useETHPrice();
  
  const ethBalanceNum = ethBalance ? parseFloat(formatEther(ethBalance.value)) : 0;
  const ethBalanceUSD = ethBalanceNum * ethPrice;
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
  }>({ isOpen: false, handle: '' });
  
  const selectedAgent = agents.find(a => a.xHandle === tradeModal.handle);

  return (
    <>
      <main style={{ padding: 'calc(var(--header-height) + 1rem) 1rem calc(var(--nav-height, 70px) + env(safe-area-inset-bottom, 0px) + 2rem)', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Your <span style={{ color: 'var(--red)' }}>Clawfolio</span> 🦞
        </h1>
        
        {isConnected && ethBalance && (
          <div style={{
            background: 'var(--black-surface)',
            border: '1px solid var(--grey-800)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Wallet Balance
              </div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {formatETH(ethBalanceNum)} ETH
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--grey-500)' }}>
                ≈ ${ethBalanceUSD < 1 ? ethBalanceUSD.toFixed(2) : ethBalanceUSD < 1000 ? ethBalanceUSD.toFixed(0) : `${(ethBalanceUSD / 1000).toFixed(1)}K`}
              </div>
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--grey-500)',
              fontFamily: 'var(--font-mono)',
            }}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>
        )}
        
        <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Tap any agent to buy or sell
        </p>
        
        {!isConnected ? (
          <div style={{ 
            background: 'var(--black-surface)', 
            borderRadius: '12px',
            border: '1px solid var(--grey-800)',
            padding: '3rem 2rem',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦞</div>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Your claws await</h2>
            <p style={{ color: 'var(--grey-400)', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Connect your wallet to see your holdings, track value, and trade.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button onClick={openConnectModal} className="btn btn-red" style={{ padding: '0.875rem 2rem' }}>
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
            <div style={{ marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--grey-600)' }}>
              Don&apos;t have any claws yet?{' '}
              <Link href="/explore" style={{ color: 'var(--red)' }}>Explore agents →</Link>
            </div>
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
