'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, AGENTS, formatETH } from '@/lib/agents';

export default function LeaderboardPage() {
  const agents = useMemo(() => {
    return getAgentList()
      .map(agent => ({
        ...agent,
        lifetimeVolumeETH: AGENTS[agent.xHandle.toLowerCase()]?.lifetimeVolumeETH || 0,
        holders: AGENTS[agent.xHandle.toLowerCase()]?.holders || 0,
      }))
      .sort((a, b) => b.priceETH - a.priceETH);
  }, []);

  const totals = useMemo(() => ({
    totalVolume: agents.reduce((acc, a) => acc + a.lifetimeVolumeETH, 0),
    totalHolders: agents.reduce((acc, a) => acc + a.holders, 0),
    totalSupply: agents.reduce((acc, a) => acc + a.supply, 0),
    verifiedCount: agents.filter(a => a.clawsVerified).length,
    totalAgents: agents.length,
  }), [agents]);

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
                    <button onClick={openAccountModal} className="btn btn-ghost mono">
                      {account.displayName}
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      <main className="main" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="section">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            <span className="text-red">Leaderboard</span>
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            All agents ranked by current price.
          </p>
          
          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <div style={{ 
              background: 'var(--black-surface)', 
              border: '1px solid var(--grey-800)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--red)' }}>
                {formatETH(totals.totalVolume)} ETH
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>
                Total Volume
              </div>
            </div>
            <div style={{ 
              background: 'var(--black-surface)', 
              border: '1px solid var(--grey-800)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {totals.totalAgents}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>
                Agents
              </div>
            </div>
            <div style={{ 
              background: 'var(--black-surface)', 
              border: '1px solid var(--grey-800)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {totals.totalHolders}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>
                Traders
              </div>
            </div>
            <div style={{ 
              background: 'var(--black-surface)', 
              border: '1px solid var(--grey-800)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>
                {totals.verifiedCount}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>
                Verified
              </div>
            </div>
          </div>
          
          {/* Table */}
          <div className="leaderboard">
            <div className="leaderboard-header">
              <div>#</div>
              <div>Agent</div>
              <div style={{ textAlign: 'right' }}>Price</div>
              <div style={{ textAlign: 'right' }}>Supply</div>
            </div>
            
            {agents.map((agent, i) => (
              <Link 
                key={agent.address}
                href={`/agent/${agent.xHandle}`}
                className="leaderboard-item"
              >
                <div className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i + 1}
                </div>
                <div className="leaderboard-agent">
                  <div className="leaderboard-avatar">
                    <Image 
                      src={agent.xProfileImage} 
                      alt={agent.name}
                      width={36}
                      height={36}
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="leaderboard-name" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {agent.name}
                      {agent.clawsVerified && (
                        <span style={{
                          width: '14px',
                          height: '14px',
                          background: 'var(--red)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.5rem',
                          color: 'white',
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="leaderboard-handle">@{agent.xHandle}</div>
                  </div>
                </div>
                <div className="leaderboard-price">{formatETH(agent.priceETH)} ETH</div>
                <div className="leaderboard-supply">{agent.supply}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
