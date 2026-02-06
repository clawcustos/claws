'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/explore', label: 'Explore' },
    { href: '/create', label: 'Create' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/verify', label: 'Verify' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo — compact on mobile */}
        <Link href="/" className="logo" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <img 
            src="/logo.jpg" 
            alt="Claws" 
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <span className="logo-text">
            <span style={{ color: 'var(--red)' }}>CLAWS</span>
            <span style={{ color: 'white' }}>.TECH</span>
          </span>
        </Link>
        
        {/* Desktop Navigation — hidden on mobile via CSS */}
        <nav className="header-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`header-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Wallet Connection */}
        <div style={{ flexShrink: 0 }}>
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
                        <button onClick={openConnectModal} className="btn btn-red">
                          Connect
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button 
                          onClick={openChainModal}
                          className="btn btn-ghost"
                          style={{ color: '#ef4444' }}
                        >
                          Wrong Network
                        </button>
                      );
                    }

                    return (
                      <button 
                        onClick={openAccountModal}
                        className="btn btn-ghost mono"
                      >
                        {account.displayName}
                      </button>
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
