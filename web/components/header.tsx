'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <div className="logo-mark">🦞</div>
          <span className="logo-text">CLAWS</span>
          <span className="logo-badge">Beta</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem',
          }}
          className="desktop-nav"
        >
          <Link 
            href="/explore" 
            style={{ 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              fontSize: '0.9375rem',
              fontWeight: 500,
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Explore
          </Link>
          <Link 
            href="/leaderboard" 
            style={{ 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              fontSize: '0.9375rem',
              fontWeight: 500,
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Leaderboard
          </Link>
          <Link 
            href="/verify" 
            style={{ 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              fontSize: '0.9375rem',
              fontWeight: 500,
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Verify
          </Link>
        </nav>
        
        {/* Wallet Connection */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button 
                        onClick={openConnectModal} 
                        className="btn btn-primary"
                      >
                        Connect
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button 
                        onClick={openChainModal}
                        className="btn btn-ghost"
                        style={{ color: 'var(--negative)' }}
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={openChainModal}
                        className="btn btn-ghost btn-sm"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.375rem',
                          padding: '0.5rem 0.75rem',
                        }}
                      >
                        {chain.hasIcon && chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain'}
                            src={chain.iconUrl}
                            style={{ width: 18, height: 18 }}
                          />
                        )}
                      </button>
                      
                      <button 
                        onClick={openAccountModal}
                        className="btn btn-ghost"
                        style={{ 
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {account.displayName}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
      
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
