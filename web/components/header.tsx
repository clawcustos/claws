'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="site-brand">
          <Image 
            src="/logo.jpg" 
            alt="Claws" 
            width={40} 
            height={40} 
            className="site-logo-img"
          />
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
