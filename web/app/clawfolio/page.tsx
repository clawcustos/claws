'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
            Your <span className="text-red">Clawfolio</span>
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            Track your claw holdings across all agents.
          </p>
          
          {!isConnected ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Connect Your Wallet</h2>
              <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem' }}>
                Connect your wallet to see your claws.
              </p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button onClick={openConnectModal} className="btn btn-red">
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h2 style={{ marginBottom: '0.5rem' }}>No Claws Yet</h2>
              <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem' }}>
                You haven't bought any claws yet. Start trading to build your portfolio.
              </p>
              <Link href="/" className="btn btn-red">
                Explore Agents
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
