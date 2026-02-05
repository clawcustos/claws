'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">🦞</div>
          <span className="logo-text">Claws</span>
        </Link>
        
        <nav className="nav">
          <Link 
            href="/" 
            className={`nav-link ${isActive('/') && pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/explore" 
            className={`nav-link ${isActive('/explore') ? 'active' : ''}`}
          >
            Explore
          </Link>
          <Link 
            href="/leaderboard" 
            className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
          >
            Leaderboard
          </Link>
          <Link 
            href="/verify" 
            className={`nav-link ${isActive('/verify') ? 'active' : ''}`}
          >
            Verify
          </Link>
        </nav>
        
        <div className="header-actions">
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
                          className="btn btn-negative"
                        >
                          Wrong Network
                        </button>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={openChainModal}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                overflow: 'hidden',
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 16, height: 16 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button 
                          onClick={openAccountModal} 
                          className="btn btn-primary"
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
      </div>
    </header>
  );
}
