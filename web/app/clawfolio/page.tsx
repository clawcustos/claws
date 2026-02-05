'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, formatETH } from '@/lib/agents';
import { useClawBalance, useCurrentPrice } from '@/hooks/useClaws';

// Single holding row
function HoldingRow({ agent, userAddress }: { 
  agent: ReturnType<typeof getAgentList>[0]; 
  userAddress: `0x${string}`;
}) {
  const { balance, isLoading } = useClawBalance(agent.xHandle, userAddress);
  const { priceETH } = useCurrentPrice(agent.xHandle);
  
  const claws = balance !== undefined ? Number(balance) : 0;
  const value = (priceETH || 0) * claws;
  
  // Don't render if user has no claws
  if (!isLoading && claws === 0) return null;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      borderBottom: '1px solid var(--grey-800)',
    }}>
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
          {isLoading ? '...' : `≈ ${formatETH(value)} ETH`}
        </div>
      </div>
    </div>
  );
}

// Holdings list that filters to only show non-zero balances
function HoldingsList({ userAddress }: { userAddress: `0x${string}` }) {
  const agents = useMemo(() => getAgentList(), []);
  
  return (
    <div style={{ 
      background: 'var(--black-surface)', 
      borderRadius: '12px',
      border: '1px solid var(--grey-800)',
    }}>
      {agents.map((agent) => (
        <HoldingRow key={agent.xHandle} agent={agent} userAddress={userAddress} />
      ))}
      
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: 'var(--grey-500)',
        fontSize: '0.875rem',
      }}>
        Only agents you hold claws in appear here
      </div>
    </div>
  );
}

export default function ClawfolioPage() {
  const { address, isConnected } = useAccount();

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">
            <span className="logo-text">CLAWS</span>
          </Link>
          
          <nav className="header-nav">
            <Link href="/" className="header-link">Home</Link>
            <Link href="/verify" className="header-link">Verify</Link>
          </nav>
          
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                  {!connected ? (
                    <button onClick={openConnectModal} className="btn btn-red">Connect</button>
                  ) : (
                    <button onClick={openAccountModal} className="btn btn-ghost">
                      {account.displayName}
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      <main style={{ padding: '6rem 1rem 6rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Your <span style={{ color: 'var(--red)' }}>Clawfolio</span>
        </h1>
        <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
          Track your claw holdings across all agents
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
          <HoldingsList userAddress={address!} />
        )}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--black-surface)',
        borderTop: '1px solid var(--grey-800)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom))',
      }}>
        <Link href="/" style={{ color: 'var(--grey-400)', textDecoration: 'none', fontSize: '0.75rem' }}>Home</Link>
        <Link href="/leaderboard" style={{ color: 'var(--grey-400)', textDecoration: 'none', fontSize: '0.75rem' }}>Leaderboard</Link>
        <Link href="/clawfolio" style={{ color: 'var(--red)', textDecoration: 'none', fontSize: '0.75rem' }}>Clawfolio</Link>
      </nav>
    </>
  );
}
