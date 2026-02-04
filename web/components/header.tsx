'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="sticky top-0 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border)] z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-lg hidden sm:block">claws</span>
        </Link>
        
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
            const connected = mounted && account && chain;
            return (
              <button
                onClick={connected ? openAccountModal : openConnectModal}
                className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {connected ? account.displayName : 'Connect'}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
