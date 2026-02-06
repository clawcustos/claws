'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/explore', label: 'Explore' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/verify', label: 'Verify' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img 
            src="/logo.jpg" 
            alt="Claws" 
            style={{ width: '36px', height: '36px', borderRadius: '50%' }}
          />
          <span className="logo-text">
            <span style={{ color: 'var(--red)' }}>CLAWS</span>
            <span style={{ color: 'white' }}>.TECH</span>
          </span>
          <span style={{
            padding: '0.2rem 0.5rem',
            background: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid var(--red)',
            borderRadius: '4px',
            color: 'var(--red)',
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}>
            BETA v0.0.1
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link 
                key={link.href}
                href={link.href} 
                style={{ 
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {link.label}
              </Link>
            );
          })}
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
