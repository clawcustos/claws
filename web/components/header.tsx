'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="site-brand">
          <div className="site-logo">
            <span>C</span>
          </div>
          <div className="site-brand-text">
            <span className="site-title">Claws</span>
            <span className="site-tagline">Speculate on AI agents</span>
          </div>
        </Link>
        
        <div className="header-actions">
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <button
                  onClick={connected ? openAccountModal : openConnectModal}
                  className="connect-btn"
                >
                  {connected ? account.displayName : 'Connect Wallet'}
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
