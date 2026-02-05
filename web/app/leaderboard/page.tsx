'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, formatETH } from '@/lib/agents';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';

// Single leaderboard row that fetches its own data
function LeaderboardRow({ agent, rank }: { agent: ReturnType<typeof getAgentList>[0]; rank: number }) {
  const { market, isLoading } = useMarket(agent.xHandle);
  const { priceETH } = useCurrentPrice(agent.xHandle);
  
  const supply = market?.supply !== undefined ? Number(market.supply) : 0;
  const price = priceETH || 0;
  const isVerified = market?.isVerified || false;
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 100px 80px',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: '1px solid var(--grey-800)',
      gap: '1rem',
    }}>
      <div style={{ 
        color: rank <= 3 ? 'var(--red)' : 'var(--grey-500)',
        fontWeight: 600,
        fontSize: '1rem',
      }}>
        {rank}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img 
          src={agent.xProfileImage || `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`}
          alt={agent.name}
          width={40}
          height={40}
          style={{ borderRadius: '50%' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.name}&background=dc2626&color=fff`;
          }}
        />
        <div>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {agent.name}
            {isVerified && <span style={{ color: '#22c55e' }}>✓</span>}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grey-500)' }}>@{agent.xHandle}</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600 }}>
          {isLoading ? '...' : supply === 0 ? 'FREE' : `${formatETH(price)} ETH`}
        </div>
      </div>
      
      <div style={{ textAlign: 'right', color: 'var(--grey-400)' }}>
        {isLoading ? '...' : supply}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const agents = useMemo(() => getAgentList(), []);

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

      <main style={{ padding: '6rem 1rem 6rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--red)' }}>Top</span> by Price
        </h1>
        <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
          Live data from the Claws contract on Base
        </p>
        
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 100px 80px',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--grey-700)',
          fontSize: '0.75rem',
          color: 'var(--grey-500)',
          textTransform: 'uppercase',
          gap: '1rem',
        }}>
          <div>#</div>
          <div>Agent</div>
          <div style={{ textAlign: 'right' }}>Price</div>
          <div style={{ textAlign: 'right' }}>Supply</div>
        </div>
        
        {/* Rows */}
        <div style={{ 
          background: 'var(--black-surface)', 
          borderRadius: '0 0 12px 12px',
          border: '1px solid var(--grey-800)',
          borderTop: 'none',
        }}>
          {agents.map((agent, i) => (
            <LeaderboardRow key={agent.xHandle} agent={agent} rank={i + 1} />
          ))}
        </div>
        
        <p style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          fontSize: '0.875rem', 
          color: 'var(--grey-600)' 
        }}>
          Prices update in real-time from the blockchain
        </p>
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
        <Link href="/leaderboard" style={{ color: 'var(--red)', textDecoration: 'none', fontSize: '0.75rem' }}>Leaderboard</Link>
        <Link href="/clawfolio" style={{ color: 'var(--grey-400)', textDecoration: 'none', fontSize: '0.75rem' }}>Clawfolio</Link>
      </nav>
    </>
  );
}
